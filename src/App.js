import React, { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale } from "chart.js";
import "chartjs-adapter-date-fns"; // Import the date adapter
import Papa from "papaparse";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main style file
import "react-date-range/dist/theme/default.css"; // Theme CSS file
import { addWeeks, startOfWeek, format } from "date-fns"; // Import date-fns for date manipulation

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale);


const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "0px",
    textAlign: "center",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  headerNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  navSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  centeredNavSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    flex: 1,
  },
  uploadButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": {
      transform: "scale(1.1) rotate(2deg)",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
    },
    ":active": {
      transform: "scale(0.95) rotate(-2deg)",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    },
  },
  button: (isActive) => ({
    padding: "10px 20px",
    borderRadius: "8px",
    backgroundColor: isActive ? "#007bff" : "#f1f1f1",
    color: isActive ? "#fff" : "#000",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": {
      transform: "scale(1.1) rotate(2deg)",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
    },
    ":active": {
      transform: "scale(0.95) rotate(-2deg)",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    },
  }),
  chartContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "20px",
    flex: 1,
  },
  chartCard: {
    width: "80%",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
    },
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
    width: "90%",
    maxWidth: "800px",
    textAlign: "center",
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  modalButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": {
      transform: "scale(1.05)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
    ":active": {
      transform: "scale(0.95)",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    },
  },
  filterButton: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
  },
  transactionTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  transactionHeader: {
    backgroundColor: "#f9f9f9",
    fontWeight: "bold",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
  },
  transactionRow: {
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px", // Add spacing between rows
  },
  transactionCell: {
    padding: "10px",
    textAlign: "left",
  },
  positiveAmount: {
    color: "green",
    fontWeight: "bold",
  },
  negativeAmount: {
    color: "red",
    fontWeight: "bold",
  },
  transactionDescription: {
    color: "#888", // Lighter color for descriptions
    fontSize: "0.9em", // Smaller font size
  },
  summaryRow: {
    fontWeight: "bold",
    backgroundColor: "#f1f1f1",
    borderTop: "2px solid #ddd",
  },
  closeButtonContainer: {
    marginTop: "20px", // Add space above the close button
  },
  transactionTableContainer: {
    maxHeight: "300px", // Limit the height of the table
    overflowY: "auto", // Enable vertical scrolling
    marginTop: "20px",
    border: "1px solid #ddd", // Add a border around the scrollable area
    borderRadius: "8px",
  },
};

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeTab, setActiveTab] = useState("line");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState({ isOpen: false, transactions: [] });
  const [uploadType, setUploadType] = useState("account"); // New state for upload type

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row) => ({
          date: new Date(row["Post Date"]),
          debit: parseFloat(row.Debit || 0),
          credit: parseFloat(row.Credit || 0),
          balance: parseFloat(row.Balance || 0),
          description: row.Description || "N/A", // Include the description field
        }));
        setTransactions(data);
        setFilteredData(data);
      },
    });
  };

  const filterByDateRange = () => {
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const filtered = transactions.filter(
        (t) => t.date >= startDate && t.date <= endDate
      );
      setFilteredData(filtered);
    }
  };

  const calculateDailyData = () => {
    const dailyData = {};
    filteredData.forEach((transaction) => {
      const day = transaction.date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      if (!dailyData[day]) {
        dailyData[day] = { balance: transaction.balance, transactions: [] };
      }
      dailyData[day].transactions.push(transaction);
    });
    return dailyData;
  };

  const calculateWeeklyData = () => {
    const weeklyData = {};
    let currentWeekStart = startOfWeek(new Date(filteredData[0]?.date || new Date()));

    filteredData.forEach((transaction) => {
      const transactionWeekStart = startOfWeek(transaction.date);
      while (currentWeekStart < transactionWeekStart) {
        // Fill missing weeks with the previous week's balance
        const previousWeekBalance = weeklyData[format(currentWeekStart, "yyyy-MM-dd")]?.balance || 0;
        currentWeekStart = addWeeks(currentWeekStart, 1);
        weeklyData[format(currentWeekStart, "yyyy-MM-dd")] = { balance: previousWeekBalance };
      }
      weeklyData[format(transactionWeekStart, "yyyy-MM-dd")] = { balance: transaction.balance };
    });

    // Fill any remaining weeks up to the current date
    const today = new Date();
    while (currentWeekStart < today) {
      const previousWeekBalance = weeklyData[format(currentWeekStart, "yyyy-MM-dd")]?.balance || 0;
      currentWeekStart = addWeeks(currentWeekStart, 1);
      weeklyData[format(currentWeekStart, "yyyy-MM-dd")] = { balance: previousWeekBalance };
    }

    return weeklyData;
  };

  const calculateMonthlyRatios = () => {
    const monthlyRatios = {};
    filteredData.forEach((transaction) => {
      const month = `${transaction.date.getFullYear()}-${transaction.date.getMonth() + 1}`;
      if (!monthlyRatios[month]) {
        monthlyRatios[month] = { income: 0, expense: 0 };
      }
      monthlyRatios[month].income += transaction.credit;
      monthlyRatios[month].expense += transaction.debit;
    });
    return monthlyRatios;
  };

  const calculateWeeklyCardData = () => {
    const weeklyData = {};
    filteredData.forEach((transaction) => {
      const weekStart = startOfWeek(transaction.date);
      const weekKey = format(weekStart, "yyyy-MM-dd");
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { expenses: 0, payments: 0 };
      }
      weeklyData[weekKey].expenses += transaction.debit || 0;
      weeklyData[weekKey].payments += transaction.credit || 0;
    });
    return weeklyData;
  };

  const handleFileUpload = (file) => {
    if (uploadType === "account") {
      parseCSV(file); // Handle account data as before
    } else if (uploadType === "card") {
      parseCSV(file); // Handle card data (processed differently in charts)
    }
  };

  const calculateScatterData = () => {
    return filteredData.map((transaction) => ({
      x: transaction.date,
      y: transaction.debit > 0 ? -transaction.debit : transaction.credit,
    }));
  };

  const scatterData = calculateScatterData();

  const dailyData = calculateDailyData();
  const dailyDates = Object.keys(dailyData).sort(); // Ensure chronological order
  const dailyBalances = dailyDates.map((date) => dailyData[date].balance);

  const weeklyData = calculateWeeklyData();
  const weeklyDates = Object.keys(weeklyData).sort(); // Ensure chronological order
  const weeklyBalances = weeklyDates.map((date) => weeklyData[date].balance);

  const monthlyRatios = calculateMonthlyRatios();
  const ratioMonths = Object.keys(monthlyRatios).sort(); // Ensure chronological order
  const monthlyIncomes = ratioMonths.map((month) => monthlyRatios[month].income);
  const monthlyExpenses = ratioMonths.map((month) => monthlyRatios[month].expense);

  const weeklyCardData = calculateWeeklyCardData();
  const weeklyCardDates = Object.keys(weeklyCardData).sort(); // Ensure chronological order
  const weeklyCardExpenses = weeklyCardDates.map((date) => weeklyCardData[date].expenses);
  const weeklyCardPayments = weeklyCardDates.map((date) => weeklyCardData[date].payments);

  const isDateFilterApplied = dateRange.start && dateRange.end;

  const handlePointClick = (context, type) => {
    if (!context.length) {
      console.log("No data point was clicked.");
      return; // Ensure a data point was clicked
    }
    const index = context[0].index;
  
    if (type === "weekly") {
      const label = dailyDates[index]; // Use dailyDates to get the correct date label
      const startOfWeekDate = startOfWeek(new Date(label));
      if (isNaN(startOfWeekDate.getTime())) {
        console.error("Invalid date parsed for weekly data:", label);
        return;
      }
      const endOfWeekDate = addWeeks(startOfWeekDate, 1);
      console.log("Weekly range:", { startOfWeek: startOfWeekDate, endOfWeek: endOfWeekDate });
      const transactionsForWeek = transactions.filter(
        (t) => t.date >= startOfWeekDate && t.date < endOfWeekDate
      );
      console.log("Transactions for the week:", transactionsForWeek);
      setTransactionDialog({ isOpen: true, transactions: transactionsForWeek });
    } else if (type === "monthly") {
      const datasetIndex = context[0].datasetIndex; // Determine if it's income or expense
      const monthLabel = ratioMonths[index]; // Use the index to get the correct month label
      const [year, month] = monthLabel.split("-");
      console.log("Monthly range:", { year, month });
  
      const transactionsForMonth = transactions.filter((t) => {
        const transactionYear = t.date.getFullYear();
        const transactionMonth = t.date.getMonth() + 1; // Months are 0-indexed
        return transactionYear === parseInt(year) && transactionMonth === parseInt(month);
      });
  
      if (datasetIndex === 0) {
        // Income dataset
        const incomeTransactions = transactionsForMonth.filter((t) => t.credit > 0);
        console.log("Income transactions for the month:", incomeTransactions);
        setTransactionDialog({ isOpen: true, transactions: incomeTransactions });
      } else if (datasetIndex === 1) {
        // Expense dataset
        const expenseTransactions = transactionsForMonth.filter((t) => t.debit > 0);
        console.log("Expense transactions for the month:", expenseTransactions);
        setTransactionDialog({ isOpen: true, transactions: expenseTransactions });
      }
    }
  };
  
  const handleCardPointClick = (context) => {
    if (!context.length) {
      console.log("No data point was clicked.");
      return; // Ensure a data point was clicked
    }
    const index = context[0].index;
    const label = weeklyCardDates[index]; // Use weeklyCardDates to get the correct date label
    const startOfWeekDate = startOfWeek(new Date(label));
    if (isNaN(startOfWeekDate.getTime())) {
      console.error("Invalid date parsed for card cumulative data:", label);
      return;
    }
    const endOfWeekDate = addWeeks(startOfWeekDate, 1);
    console.log("Weekly range:", { startOfWeek: startOfWeekDate, endOfWeek: endOfWeekDate });
    const transactionsForWeek = transactions.filter(
      (t) => t.date >= startOfWeekDate && t.date < endOfWeekDate
    );
    console.log("Transactions for the week:", transactionsForWeek);
    setTransactionDialog({ isOpen: true, transactions: transactionsForWeek });
  };

  const handleScatterPointClick = (context) => {
    if (!context.length) {
      console.log("No data point was clicked.");
      return; // Ensure a data point was clicked
    }
    const index = context[0].index;
    const transaction = scatterData[index]; // Get the clicked transaction
    console.log("Clicked transaction:", transaction);

    const startOfDay = new Date(transaction.x);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(transaction.x);
    endOfDay.setHours(23, 59, 59, 999);

    const transactionsForDay = transactions.filter(
      (t) => t.date >= startOfDay && t.date <= endOfDay
    );
    console.log("Transactions for the day:", transactionsForDay);
    setTransactionDialog({ isOpen: true, transactions: transactionsForDay });
  };

  const handleAccountPointClick = (context) => {
    if (!context.length) {
      console.log("No data point was clicked.");
      return; // Ensure a data point was clicked
    }
    const index = context[0].index;
    const label = dailyDates[index]; // Use dailyDates to get the correct date label
    const startOfDay = new Date(label);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(label);
    endOfDay.setHours(23, 59, 59, 999);

    const transactionsForDay = transactions.filter(
      (t) => t.date >= startOfDay && t.date <= endOfDay
    );
    console.log("Transactions for the day:", transactionsForDay);
    setTransactionDialog({ isOpen: true, transactions: transactionsForDay });
  };

  const calculateSummary = (transactions) => {
    const totalAmount = transactions.reduce(
      (sum, t) => sum + (t.debit > 0 ? -t.debit : t.credit),
      0
    );
    return {
      totalAmount,
      count: transactions.length,
    };
  };

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange({ start: startDate, end: endDate });
  };

  const calculateCardExpenses = () => {
    let cumulativeDebt = 0;
    return weeklyCardDates.map((date) => {
      cumulativeDebt += weeklyCardExpenses[weeklyCardDates.indexOf(date)];
      cumulativeDebt -= weeklyCardPayments[weeklyCardDates.indexOf(date)];
      return cumulativeDebt;
    });
  };

  const cardExpensesData = calculateCardExpenses();

  const handleMonthlyBarClick = (context) => {
    if (!context.length) {
      console.log("No data point was clicked.");
      return; // Ensure a data point was clicked
    }
    const index = context[0].index;
    const datasetIndex = context[0].datasetIndex; // Determine if it's income or expense
    const monthLabel = ratioMonths[index]; // Use the index to get the correct month label
    const [year, month] = monthLabel.split("-");

    console.log("Monthly range:", { year, month });

    const transactionsForMonth = transactions.filter((t) => {
      const transactionYear = t.date.getFullYear();
      const transactionMonth = t.date.getMonth() + 1; // Months are 0-indexed
      return transactionYear === parseInt(year) && transactionMonth === parseInt(month);
    });

    if (datasetIndex === 0) {
      // Income dataset
      const incomeTransactions = transactionsForMonth.filter((t) => t.credit > 0);
      console.log("Income transactions for the month:", incomeTransactions);
      setTransactionDialog({ isOpen: true, transactions: incomeTransactions });
    } else if (datasetIndex === 1) {
      // Expense dataset
      const expenseTransactions = transactionsForMonth.filter((t) => t.debit > 0);
      console.log("Expense transactions for the month:", expenseTransactions);
      setTransactionDialog({ isOpen: true, transactions: expenseTransactions });
    }
  };

  const handleAccountWeeklyPointClick = (context) => {
    if (!context.length) {
      console.log("No data point was clicked.");
      return; // Ensure a data point was clicked
    }
    const index = context[0].index;
    const label = dailyDates[index]; // Use dailyDates to get the correct date label
    const startOfWeekDate = startOfWeek(new Date(label));
    const endOfWeekDate = addWeeks(startOfWeekDate, 1);

    console.log("Weekly range:", { startOfWeek: startOfWeekDate, endOfWeek: endOfWeekDate });

    const transactionsForWeek = transactions.filter(
      (t) => t.date >= startOfWeekDate && t.date < endOfWeekDate
    );

    console.log("Transactions for the week:", transactionsForWeek);
    setTransactionDialog({ isOpen: true, transactions: transactionsForWeek });
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerNav}>
        {/* Left Section: Filter */}
        <div style={styles.navSection}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={styles.uploadButton}
          >
            Dates
          </button>
        </div>

        {/* Middle Section: Tabs */}
        <div style={styles.centeredNavSection}>
          {uploadType === "account" ? (
            <>
              <button
                onClick={() => setActiveTab("line")}
                style={styles.button(activeTab === "line")}
              >
                Account Balance by Week
              </button>
              <button
                onClick={() => setActiveTab("bar")}
                style={styles.button(activeTab === "bar")}
              >
                Expense to Income
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("cumulative")}
                style={styles.button(activeTab === "cumulative")}
              >
                Card Expenses
              </button>
              <button
                onClick={() => setActiveTab("scatter")}
                style={styles.button(activeTab === "scatter")}
              >
                Transaction Scatter
              </button>
            </>
          )}
        </div>

        {/* Right Section: Upload Data */}
        <div style={styles.navSection}>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", marginRight: "10px" }}
          >
            <option value="account">Account Data</option>
            <option value="card">Card Data</option>
          </select>
          <label htmlFor="file-upload" style={styles.uploadButton}>
            Upload Data
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {isDateFilterApplied && (
        <div style={{ marginBottom: "10px", fontStyle: "italic" }}>
          Showing data from {new Date(dateRange.start).toLocaleDateString()} to{" "}
          {new Date(dateRange.end).toLocaleDateString()}
        </div>
      )}

      <div style={styles.chartContainer}>
        {uploadType === "account" && activeTab === "line" && (
          <div style={styles.chartCard}>
            <Line
              data={{
                labels: dailyDates,
                datasets: [
                  {
                    label: "Weekly Balance",
                    data: dailyBalances,
                    borderColor: "blue",
                    fill: false,
                    pointBackgroundColor: "blue",
                    pointBorderColor: "blue",
                    pointRadius: 4,
                  },
                ],
              }}
              options={{
                onClick: (event, context) => handleAccountWeeklyPointClick(context),
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `Balance: ${context.raw.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}`,
                    },
                  },
                },
              }}
            />
          </div>
        )}
        {uploadType === "account" && activeTab === "bar" && (
          <div style={styles.chartCard}>
            <Bar
              data={{
                labels: ratioMonths,
                datasets: [
                  {
                    label: "Income",
                    data: monthlyIncomes,
                    backgroundColor: "green",
                  },
                  {
                    label: "Expense",
                    data: monthlyExpenses,
                    backgroundColor: "red",
                  },
                ],
              }}
              options={{
                onClick: (event, context) => handleMonthlyBarClick(context),
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `${context.dataset.label}: ${context.raw.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )}`,
                    },
                  },
                },
              }}
            />
          </div>
        )}
        {uploadType === "card" && activeTab === "cumulative" && (
          <div style={styles.chartCard}>
            <Line
              data={{
                labels: weeklyCardDates,
                datasets: [
                  {
                    label: "Card Expenses",
                    data: cardExpensesData,
                    borderColor: "red",
                    fill: false,
                    pointBackgroundColor: "red",
                    pointBorderColor: "red",
                    pointRadius: 8, // Increase dot size
                  },
                ],
              }}
              options={{
                onClick: (event, context) => handleCardPointClick(context),
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `Debt: ${context.raw.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}`,
                    },
                  },
                },
              }}
            />
          </div>
        )}
        {uploadType === "card" && activeTab === "scatter" && (
          <div style={styles.chartCard}>
            <Line
              type="scatter"
              data={{
                datasets: [
                  {
                    label: "Transactions",
                    data: scatterData,
                    backgroundColor: "blue",
                    pointRadius: 8, // Increase dot size
                    showLine: false, // Disable lines between points
                  },
                ],
              }}
              options={{
                onClick: (event, context) => handleScatterPointClick(context),
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `Date: ${new Date(context.raw.x).toLocaleDateString()}, Amount: ${context.raw.y.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )}`,
                    },
                  },
                },
                scales: {
                  x: {
                    type: "time",
                    time: {
                      unit: "week",
                    },
                    title: {
                      display: true,
                      text: "Date",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Amount",
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {transactionDialog.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Transactions</h3>
            <div style={styles.transactionTableContainer}>
              <table style={styles.transactionTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Date</th>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Description</th>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionDialog.transactions.map((t, index) => (
                    <tr key={index} style={styles.transactionRow}>
                      <td style={styles.transactionCell}>{t.date.toLocaleDateString()}</td>
                      <td style={{ ...styles.transactionCell, ...styles.transactionDescription }}>
                        {t.description}
                      </td>
                      <td
                        style={{
                          ...styles.transactionCell,
                          ...(t.debit > 0 ? styles.negativeAmount : styles.positiveAmount),
                        }}
                      >
                        {t.debit > 0
                          ? `-${t.debit.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}`
                          : t.credit.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.closeButtonContainer}>
              <button
                onClick={() => setTransactionDialog({ isOpen: false, transactions: [] })}
                style={{ ...styles.modalButton, ...styles.cancelButton }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <DateRangePicker
              ranges={[
                {
                  startDate: dateRange.start || new Date(),
                  endDate: dateRange.end || new Date(),
                  key: "selection",
                },
              ]}
              onChange={handleDateRangeChange}
            />
            <div style={styles.modalButtonContainer}>
              <button
                onClick={() => {
                  filterByDateRange();
                  setIsModalOpen(false);
                }}
                style={{ ...styles.modalButton, ...styles.filterButton }}
              >
                Filter
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ ...styles.modalButton, ...styles.cancelButton }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;