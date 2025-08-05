import React, { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale } from "chart.js";
import "chartjs-adapter-date-fns"; // Import the date adapter
import Papa from "papaparse";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main style file
import "react-date-range/dist/theme/default.css"; // Theme CSS file
import { addWeeks, startOfWeek } from "date-fns"; // Import date-fns for date manipulation

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale);

const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    padding: "24px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f5f5f7",
    color: "#1d1d1f",
  },
  header: {
    marginBottom: "32px",
  },
  greeting: {
    fontSize: "32px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#1d1d1f",
  },
  subtitle: {
    fontSize: "24px",
    fontWeight: "400",
    marginBottom: "16px",
    color: "#6e6e73",
  },
  description: {
    fontSize: "16px",
    color: "#86868b",
    marginBottom: "32px",
  },
  quickActions: {
    display: "flex",
    gap: "16px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },
  actionCard: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e5e7",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minWidth: "200px",
    textAlign: "left",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    },
  },
  actionTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1d1d1f",
    marginBottom: "4px",
  },
  actionIcon: {
    fontSize: "24px",
    marginBottom: "8px",
  },
  mainContent: {
    display: "flex",
    gap: "24px",
    flex: 1,
  },
  leftPanel: {
    flex: 2,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e5e5e7",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
    maxHeight: "600px",
    overflowY: "auto",
  },
  chartCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e5e5e7",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
  },
  chartTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1d1d1f",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e5e5e7",
    backgroundColor: "#f9f9f9",
    fontSize: "16px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s ease",
    "&:focus": {
      borderColor: "#007aff",
      backgroundColor: "white",
    },
  },
  button: (variant = "primary") => ({
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    backgroundColor: variant === "primary" ? "#007aff" : "#f2f2f7",
    color: variant === "primary" ? "white" : "#1d1d1f",
    "&:hover": {
      transform: "scale(1.02)",
      backgroundColor: variant === "primary" ? "#0056cc" : "#e5e5ea",
    },
    "&:active": {
      transform: "scale(0.98)",
    },
  }),
  expenseList: {
    marginTop: "16px",
  },
  expenseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    marginBottom: "8px",
    border: "1px solid #e5e5e7",
  },
  expenseColor: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    marginRight: "12px",
  },
  deleteButton: {
    padding: "4px 8px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#ff3b30",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
  },  modalOverlay: {
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
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
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
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.02)",
    },
    "&:active": {
      transform: "scale(0.98)",
    },
  },
  filterButton: {
    backgroundColor: "#007aff",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#f2f2f7",
    color: "#1d1d1f",
  },
  transactionTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  transactionHeader: {
    backgroundColor: "#f9f9f9",
    fontWeight: "600",
    textAlign: "left",
    borderBottom: "2px solid #e5e5e7",
  },
  transactionRow: {
    borderBottom: "1px solid #e5e5e7",
    paddingBottom: "10px",
  },
  transactionCell: {
    padding: "12px",
    textAlign: "left",
  },
  positiveAmount: {
    color: "#34c759",
    fontWeight: "600",
  },
  negativeAmount: {
    color: "#ff3b30",
    fontWeight: "600",
  },
  transactionDescription: {
    color: "#6e6e73",
    fontSize: "14px",
  },
  summaryRow: {
    fontWeight: "600",
    backgroundColor: "#f9f9f9",
    borderTop: "2px solid #e5e5e7",
  },
  closeButtonContainer: {
    marginTop: "20px",
  },
  transactionTableContainer: {
    maxHeight: "300px",
    overflowY: "auto",
    marginTop: "20px",
    border: "1px solid #e5e5e7",
    borderRadius: "12px",
  },
};

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeTab, setActiveTab] = useState("line");
  const [isModalOpen, setIsModalOpen] = useState(false);  const [transactionDialog, setTransactionDialog] = useState({ isOpen: false, transactions: [] });
  const [additionalExpenses, setAdditionalExpenses] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  // Color palette for additional expenses
  const expenseColors = [
    "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57",
    "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43"
  ];

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
          description: row.Description || "N/A",
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
      const day = transaction.date.toISOString().split("T")[0];
      if (!dailyData[day]) {
        dailyData[day] = { balance: transaction.balance, transactions: [] };
      }
      dailyData[day].transactions.push(transaction);
    });
    return dailyData;
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

  const handleFileUpload = (file) => {
    parseCSV(file);
  };

  const addExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      const expense = {
        id: Date.now(),
        name: newExpenseName,
        amount: parseFloat(newExpenseAmount),
        color: expenseColors[additionalExpenses.length % expenseColors.length]
      };
      setAdditionalExpenses([...additionalExpenses, expense]);
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  };

  const removeExpense = (id) => {
    setAdditionalExpenses(additionalExpenses.filter(exp => exp.id !== id));
  };

  const dailyData = calculateDailyData();  const dailyDates = Object.keys(dailyData).sort((a, b) => a.localeCompare(b));
  const dailyBalances = dailyDates.map((date) => dailyData[date].balance);

  const monthlyRatios = calculateMonthlyRatios();
  const ratioMonths = Object.keys(monthlyRatios).sort((a, b) => a.localeCompare(b));
  const monthlyIncomes = ratioMonths.map((month) => monthlyRatios[month].income);
  const monthlyExpenses = ratioMonths.map((month) => monthlyRatios[month].expense);

  // Create datasets for the bar chart including additional expenses
  const createBarChartDatasets = () => {
    const datasets = [
      {
        label: "Income",
        data: monthlyIncomes,
        backgroundColor: "#34c759",
      },
      {
        label: "Base Expenses",
        data: monthlyExpenses,
        backgroundColor: "#ff3b30",
      }
    ];

    // Add additional expenses as stacked bars
    additionalExpenses.forEach((expense) => {
      datasets.push({
        label: expense.name,
        data: ratioMonths.map(() => expense.amount),
        backgroundColor: expense.color,
      });
    });

    return datasets;
  };

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange({ start: startDate, end: endDate });
  };

  const handleMonthlyBarClick = (context) => {
    if (!context.length) return;
    const index = context[0].index;
    const datasetIndex = context[0].datasetIndex;
    const monthLabel = ratioMonths[index];
    const [year, month] = monthLabel.split("-");

    const transactionsForMonth = transactions.filter((t) => {
      const transactionYear = t.date.getFullYear();
      const transactionMonth = t.date.getMonth() + 1;
      return transactionYear === parseInt(year) && transactionMonth === parseInt(month);
    });

    if (datasetIndex === 0) {
      const incomeTransactions = transactionsForMonth.filter((t) => t.credit > 0);
      setTransactionDialog({ isOpen: true, transactions: incomeTransactions });
    } else if (datasetIndex === 1) {
      const expenseTransactions = transactionsForMonth.filter((t) => t.debit > 0);
      setTransactionDialog({ isOpen: true, transactions: expenseTransactions });
    }
  };

  const handleAccountWeeklyPointClick = (context) => {
    if (!context.length) return;
    const index = context[0].index;
    const label = dailyDates[index];
    const startOfWeekDate = startOfWeek(new Date(label));
    const endOfWeekDate = addWeeks(startOfWeekDate, 1);

    const transactionsForWeek = transactions.filter(
      (t) => t.date >= startOfWeekDate && t.date < endOfWeekDate
    );
    setTransactionDialog({ isOpen: true, transactions: transactionsForWeek });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.greeting}>Hi there!</div>
        <div style={styles.subtitle}>What would you like to know?</div>
        <div style={styles.description}>
          Use one of the most common prompts below or use your own to begin
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>        <button 
          style={styles.actionCard}
          onClick={() => setActiveTab("line")}
        >
          <div style={styles.actionIcon}>📊</div>
          <div style={styles.actionTitle}>View account balance over time</div>
        </button>
        <button 
          style={styles.actionCard}
          onClick={() => setActiveTab("bar")}
        >
          <div style={styles.actionIcon}>💰</div>
          <div style={styles.actionTitle}>Analyze income vs expenses monthly</div>
        </button>
        <button 
          style={styles.actionCard}
          onClick={() => setIsModalOpen(true)}
        >
          <div style={styles.actionIcon}>📅</div>
          <div style={styles.actionTitle}>Filter by date range</div>
        </button>        <label htmlFor="file-upload" style={styles.actionCard}>
          <div style={styles.actionIcon}>📤</div>
          <div style={styles.actionTitle}>Upload financial data</div>
          <div style={{ marginTop: "8px", fontSize: "14px", color: "#86868b" }}>
            Choose file
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel - Charts */}
        <div style={styles.leftPanel}>
          {activeTab === "line" && (
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>Account Balance Over Time</div>
              <Line
                data={{
                  labels: dailyDates,
                  datasets: [
                    {
                      label: "Account Balance",
                      data: dailyBalances,
                      borderColor: "#007aff",
                      backgroundColor: "rgba(0, 122, 255, 0.1)",
                      fill: true,
                      pointBackgroundColor: "#007aff",
                      pointBorderColor: "#007aff",
                      pointRadius: 4,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  onClick: (event, context) => handleAccountWeeklyPointClick(context),
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {                      callbacks: {
                        label: (context) =>
                          `Balance: $${Number(context.raw).toLocaleString("en-US")}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      grid: {
                        color: "#f0f0f0",
                      },
                    },
                    x: {
                      grid: {
                        color: "#f0f0f0",
                      },
                    },
                  },
                }}
              />
            </div>
          )}

          {activeTab === "bar" && (
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>Monthly Income vs Expenses</div>
              <Bar
                data={{
                  labels: ratioMonths,
                  datasets: createBarChartDatasets(),
                }}
                options={{
                  onClick: (event, context) => handleMonthlyBarClick(context),
                  responsive: true,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {                      callbacks: {
                        label: (context) =>
                          `${context.dataset.label}: ${Number(context.raw).toLocaleString(
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
        </div>

        {/* Right Panel - Expense Management */}
        <div style={styles.rightPanel}>
          <div style={styles.chartTitle}>Additional Expenses</div>
          <div style={styles.description}>
            Add hypothetical expenses to see how they would impact your monthly budget
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Expense name"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              style={{ ...styles.input, marginBottom: "8px" }}
            />
            <input
              type="number"
              placeholder="Monthly amount"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              style={{ ...styles.input, marginBottom: "8px" }}
            />
            <button
              onClick={addExpense}
              style={styles.button("primary")}
            >
              Add Expense
            </button>
          </div>

          <div style={styles.expenseList}>
            {additionalExpenses.map((expense) => (
              <div key={expense.id} style={styles.expenseItem}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      ...styles.expenseColor,
                      backgroundColor: expense.color,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: "500" }}>{expense.name}</div>
                    <div style={{ color: "#6e6e73", fontSize: "14px" }}>
                      {expense.amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })} / month
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeExpense(expense.id)}
                  style={styles.deleteButton}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {additionalExpenses.length === 0 && (
            <div style={{ textAlign: "center", color: "#6e6e73", marginTop: "32px" }}>
              No additional expenses added yet
            </div>
          )}
        </div>
      </div>      {transactionDialog.isOpen && (
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
                <tbody>                  {transactionDialog.transactions.map((t) => (
                    <tr key={`${t.date.getTime()}-${t.description}`} style={styles.transactionRow}>
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