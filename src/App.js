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
  },  expenseColor: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    marginRight: "12px",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },  deleteButton: {
    padding: "4px 8px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#ff3b30",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
  },modalOverlay: {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);  const [transactionDialog, setTransactionDialog] = useState({ isOpen: false, transactions: [] });
  const [additionalExpenses, setAdditionalExpenses] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");  const [additionalIncomes, setAdditionalIncomes] = useState([]);
  const [newIncomeName, setNewIncomeName] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [colorPaletteUrl, setColorPaletteUrl] = useState("");
  const [customColors, setCustomColors] = useState([]);

  // Default pastel color palette for both income and expenses
  const defaultPastelColors = [
    "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
    "#D4BAE8", "#F8D7DA", "#E2F0CB", "#B3E5FC", "#FFCCCB",
    "#F0E68C", "#DDA0DD", "#98FB98", "#F5DEB3", "#FFE4E1",
    "#E6E6FA", "#FFF8DC", "#B0E0E6", "#FFDAB9", "#EEE8AA"
  ];

  // Get current color palette (custom or default)
  const getCurrentColorPalette = () => {
    return customColors.length > 0 ? customColors : defaultPastelColors;
  };

  // Function to parse Coolors URL and extract colors
  const parseColorsUrl = (url) => {
    try {
      // Handle different Coolors URL formats
      let colorString = "";
      
      if (url.includes("coolors.co/palette/")) {
        colorString = url.split("coolors.co/palette/")[1];
      } else if (url.includes("coolors.co/")) {
        colorString = url.split("coolors.co/")[1];
      } else {
        return [];
      }
      
      // Remove any additional parameters
      colorString = colorString.split("?")[0].split("#")[0];
      
      // Split colors and convert to hex format
      const colors = colorString.split("-").map(color => {
        // Ensure color is 6 characters
        const cleanColor = color.replace(/[^a-fA-F0-9]/g, "");
        if (cleanColor.length === 6) {
          return `#${cleanColor.toUpperCase()}`;
        }
        return null;
      }).filter(color => color !== null);
      
      return colors;
    } catch (error) {
      console.error("Error parsing Coolors URL:", error);
      return [];
    }
  };
  // Function to apply Coolors palette
  const applyColorPalette = () => {
    if (!colorPaletteUrl.trim()) {
      setCustomColors([]);
      return;
    }
    
    const colors = parseColorsUrl(colorPaletteUrl);
    if (colors.length > 0) {
      setCustomColors(colors);
      
      // Update existing items with new colors from the palette
      // Skip first 2 colors which are reserved for bank income/expenses
      const itemStartIndex = 2;
      
      setAdditionalIncomes(prev => prev.map((income, index) => ({
        ...income,
        color: colors[(itemStartIndex + index) % colors.length]
      })));
      
      setAdditionalExpenses(prev => prev.map((expense, index) => ({
        ...expense,
        color: colors[(itemStartIndex + additionalIncomes.length + index) % colors.length]
      })));
    }
  };

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
  };  const addExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      const currentPalette = getCurrentColorPalette();
      // Skip first 2 colors if using custom palette (reserved for bank income/expenses)
      const startIndex = customColors.length > 0 ? 2 : 0;
      const colorIndex = (startIndex + additionalIncomes.length + additionalExpenses.length) % currentPalette.length;
      
      const expense = {
        id: Date.now(),
        name: newExpenseName,
        amount: parseFloat(newExpenseAmount),
        color: currentPalette[colorIndex]
      };
      setAdditionalExpenses([...additionalExpenses, expense]);
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  };

  const removeExpense = (id) => {
    setAdditionalExpenses(additionalExpenses.filter(exp => exp.id !== id));
  };  const addIncome = () => {
    if (newIncomeName && newIncomeAmount) {
      const currentPalette = getCurrentColorPalette();
      // Skip first 2 colors if using custom palette (reserved for bank income/expenses)
      const startIndex = customColors.length > 0 ? 2 : 0;
      const colorIndex = (startIndex + additionalIncomes.length) % currentPalette.length;
      
      const income = {
        id: Date.now(),
        name: newIncomeName,
        amount: parseFloat(newIncomeAmount),
        color: currentPalette[colorIndex]
      };
      setAdditionalIncomes([...additionalIncomes, income]);
      setNewIncomeName("");
      setNewIncomeAmount("");
    }
  };
  const removeIncome = (id) => {
    setAdditionalIncomes(additionalIncomes.filter(inc => inc.id !== id));
  };
  const cycleIncomeColor = (id) => {
    setAdditionalIncomes(additionalIncomes.map(income => {
      if (income.id === id) {
        const currentPalette = getCurrentColorPalette();
        const currentIndex = currentPalette.indexOf(income.color);
        const nextIndex = (currentIndex + 1) % currentPalette.length;
        return { ...income, color: currentPalette[nextIndex] };
      }
      return income;
    }));
  };

  const cycleExpenseColor = (id) => {
    setAdditionalExpenses(additionalExpenses.map(expense => {
      if (expense.id === id) {
        const currentPalette = getCurrentColorPalette();
        const currentIndex = currentPalette.indexOf(expense.color);
        const nextIndex = (currentIndex + 1) % currentPalette.length;
        return { ...expense, color: currentPalette[nextIndex] };
      }
      return expense;
    }));
  };

  const dailyData = calculateDailyData();  const dailyDates = Object.keys(dailyData).sort((a, b) => a.localeCompare(b));
  const dailyBalances = dailyDates.map((date) => dailyData[date].balance);  const monthlyRatios = calculateMonthlyRatios();
  const ratioMonths = Object.keys(monthlyRatios).sort((a, b) => a.localeCompare(b));

  // Calculate average leftover per month
  const calculateAverageLeftover = () => {
    if (ratioMonths.length === 0) return 0;
    
    const totalLeftover = ratioMonths.reduce((sum, month) => {
      const monthData = monthlyRatios[month];
      const additionalIncome = additionalIncomes.reduce((total, income) => total + income.amount, 0);
      const additionalExpense = additionalExpenses.reduce((total, expense) => total + expense.amount, 0);
      const leftover = (monthData.income + additionalIncome) - (monthData.expense + additionalExpense);
      return sum + leftover;
    }, 0);
    
    return totalLeftover / ratioMonths.length;
  };  // Create datasets for the bar chart showing actual income vs expenses side by side
  const createBarChartDatasets = () => {
    const datasets = [];
    const currentPalette = getCurrentColorPalette();

    // Bank Income - Use first color from palette or default green
    const bankIncomeData = ratioMonths.map((month) => monthlyRatios[month].income);
    datasets.push({
      label: 'Bank Income',
      data: bankIncomeData,
      backgroundColor: customColors.length > 0 ? currentPalette[0] : '#34c759',
      borderColor: 'white',
      borderWidth: 2,
      stack: 'income',
    });

    // Individual Additional Incomes - Each with their own color (stacked on top of bank income)
    additionalIncomes.forEach((income) => {
      const incomeData = ratioMonths.map(() => income.amount);
      datasets.push({
        label: income.name,
        data: incomeData,
        backgroundColor: income.color,
        borderColor: 'white',
        borderWidth: 2,
        stack: 'income',
      });
    });    // Bank Expenses - Use second color from palette or default red
    const bankExpenseData = ratioMonths.map((month) => monthlyRatios[month].expense);
    datasets.push({
      label: 'Bank Expenses',
      data: bankExpenseData,
      backgroundColor: customColors.length > 1 ? currentPalette[1] : '#ff3b30',
      borderColor: 'white',
      borderWidth: 2,
      stack: 'expenses',
    });

    // Individual Additional Expenses - Each with their own color (stacked on top of bank expenses)
    additionalExpenses.forEach((expense) => {
      const expenseData = ratioMonths.map(() => expense.amount);
      datasets.push({
        label: expense.name,
        data: expenseData,
        backgroundColor: expense.color,
        borderColor: 'white',
        borderWidth: 2,
        stack: 'expenses',
      });
    });

    return datasets;
  };

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange({ start: startDate, end: endDate });
  };  const handleMonthlyBarClick = (context) => {
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

    // Check if it's an income dataset (Bank Income or any Additional Income)
    const totalIncomeDatasets = 1 + additionalIncomes.length; // Bank Income + Additional Incomes
    
    if (datasetIndex < totalIncomeDatasets) {
      // Income clicked (either bank or additional)
      const incomeTransactions = transactionsForMonth.filter((t) => t.credit > 0);
      setTransactionDialog({ isOpen: true, transactions: incomeTransactions });
    } else {
      // Expenses clicked (either bank or additional)
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
    <div style={styles.container}>      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={styles.greeting}>Hi there!</div>
            <div style={styles.subtitle}>What would you like to know?</div>
            <div style={styles.description}>
              Use one of the most common prompts below or use your own to begin
            </div>
          </div>
          <button
            onClick={() => setIsColorSettingsOpen(true)}
            style={{
              ...styles.button("secondary"),
              backgroundColor: "white",
              border: "1px solid #e5e5e7",
              borderRadius: "8px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              marginTop: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            title="Color Settings"
          >
            ⚙️ Colors
          </button>
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
          )}          {activeTab === "bar" && (
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>Monthly Income vs Expenses</div>
              <div style={{ 
                fontSize: "14px", 
                color: "#6e6e73", 
                marginBottom: "16px",
                textAlign: "center"
              }}>
                Average Leftover: <span style={{ 
                  color: calculateAverageLeftover() >= 0 ? "#34c759" : "#ff3b30",
                  fontWeight: "600"
                }}>
                  {calculateAverageLeftover().toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })} / month
                </span>
              </div>
              <Bar
                data={{
                  labels: ratioMonths,
                  datasets: createBarChartDatasets(),
                }}                options={{
                  onClick: (event, context) => handleMonthlyBarClick(context),
                  responsive: true,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          });
                        }
                      }
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
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
        </div>        {/* Right Panel - Income & Expense Management */}
        <div style={styles.rightPanel}>
          <div style={styles.chartTitle}>Additional Income & Expenses</div>
          <div style={styles.description}>
            Add hypothetical income and expenses to see how they would impact your monthly budget
          </div>
            {/* Summary Section */}
          <div style={{ 
            backgroundColor: "#f9f9f9", 
            padding: "16px", 
            borderRadius: "8px", 
            marginBottom: "24px",
            border: "1px solid #e5e5e7"
          }}>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#1d1d1f" }}>
              Monthly Financial Summary
            </div>
            
            {/* Bank data summary */}
            {filteredData.length > 0 && ratioMonths.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ color: "#34c759", fontSize: "14px", marginBottom: "4px" }}>
                  Avg Bank Income: +{(ratioMonths.reduce((sum, month) => sum + monthlyRatios[month].income, 0) / ratioMonths.length).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })} / month
                </div>
                <div style={{ color: "#ff3b30", fontSize: "14px", marginBottom: "4px" }}>
                  Avg Bank Expenses: -{(ratioMonths.reduce((sum, month) => sum + monthlyRatios[month].expense, 0) / ratioMonths.length).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })} / month
                </div>
              </div>
            )}
            
            {/* Additional income/expenses */}
            {additionalIncomes.length > 0 && (
              <div style={{ color: "#34c759", fontSize: "14px", marginBottom: "4px" }}>
                Additional Income: +{additionalIncomes.reduce((total, income) => total + income.amount, 0).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })} / month
              </div>
            )}
            {additionalExpenses.length > 0 && (
              <div style={{ color: "#ff3b30", fontSize: "14px", marginBottom: "4px" }}>
                Additional Expenses: -{additionalExpenses.reduce((total, expense) => total + expense.amount, 0).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })} / month
              </div>
            )}
            
            {/* Average leftover */}
            <div style={{ 
              color: calculateAverageLeftover() >= 0 ? "#34c759" : "#ff3b30", 
              fontSize: "16px", 
              fontWeight: "600", 
              borderTop: "1px solid #e5e5e7", 
              paddingTop: "8px", 
              marginTop: "8px" 
            }}>
              Average Leftover: {calculateAverageLeftover() >= 0 ? '+' : ''}{calculateAverageLeftover().toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })} / month            </div>
          </div>
          
          {/* Income Section */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ marginBottom: "12px", color: "#34c759" }}>Additional Income</h4>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Income source name"
                value={newIncomeName}
                onChange={(e) => setNewIncomeName(e.target.value)}
                style={{ ...styles.input, marginBottom: "8px" }}
              />
              <input
                type="number"
                placeholder="Monthly amount"
                value={newIncomeAmount}
                onChange={(e) => setNewIncomeAmount(e.target.value)}
                style={{ ...styles.input, marginBottom: "8px" }}
              />
              <button
                onClick={addIncome}
                style={{ ...styles.button("primary"), backgroundColor: "#34c759" }}
              >
                Add Income
              </button>
            </div>            <div style={styles.expenseList}>
              {additionalIncomes.map((income) => (
                <div key={income.id} style={styles.expenseItem}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        ...styles.expenseColor,
                        backgroundColor: income.color,
                      }}                      onClick={() => cycleIncomeColor(income.id)}
                      title="Click to cycle through colors"
                    />
                    <div>
                      <div style={{ fontWeight: "500" }}>{income.name}</div>
                      <div style={{ color: "#6e6e73", fontSize: "14px" }}>
                        {income.amount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })} / month
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeIncome(income.id)}
                    style={styles.deleteButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {additionalIncomes.length === 0 && (
              <div style={{ textAlign: "center", color: "#6e6e73", marginTop: "16px", fontSize: "14px" }}>
                No additional income added yet
              </div>
            )}
          </div>

          {/* Expenses Section */}
          <div>
            <h4 style={{ marginBottom: "12px", color: "#ff3b30" }}>Additional Expenses</h4>
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
            </div>            <div style={styles.expenseList}>
              {additionalExpenses.map((expense) => (
                <div key={expense.id} style={styles.expenseItem}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        ...styles.expenseColor,
                        backgroundColor: expense.color,
                      }}                      onClick={() => cycleExpenseColor(expense.id)}
                      title="Click to cycle through colors"
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
              <div style={{ textAlign: "center", color: "#6e6e73", marginTop: "16px", fontSize: "14px" }}>
                No additional expenses added yet
              </div>
            )}
          </div>
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
            </div>          </div>
        </div>
      )}

      {/* Color Settings Modal */}
      {isColorSettingsOpen && (
        <div style={styles.modalOverlay}>
          <div style={{
            ...styles.modalContent,
            maxWidth: "600px",
            textAlign: "left"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "24px",
              borderBottom: "1px solid #e5e5e7",
              paddingBottom: "16px"
            }}>
              <h2 style={{ margin: 0, color: "#1d1d1f", fontSize: "20px", fontWeight: "600" }}>
                Color Settings
              </h2>              <button
                onClick={() => setIsColorSettingsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6e6e73",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "background-color 0.2s ease"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#f0f0f0"}
                onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
                onFocus={(e) => e.target.style.backgroundColor = "#f0f0f0"}
                onBlur={(e) => e.target.style.backgroundColor = "transparent"}
                aria-label="Close color settings"
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#1d1d1f" }}>
                Custom Color Palette
              </div>              <div style={{ fontSize: "14px", color: "#6e6e73", marginBottom: "16px" }}>
                Paste a Coolors URL to use custom colors for your income and expense items. The first color will be used for bank income, the second for bank expenses, and remaining colors for additional items.
              </div>
              
              <div style={{ marginBottom: "16px" }}>                <label htmlFor="coolors-url-input" style={{ 
                  display: "block", 
                  fontSize: "14px", 
                  fontWeight: "500", 
                  marginBottom: "8px", 
                  color: "#1d1d1f" 
                }}>
                  Coolors URL:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    id="coolors-url-input"
                    type="text"
                    placeholder="https://coolors.co/palette/8ecae6-219ebc-023047-ffb703-fb8500"
                    value={colorPaletteUrl}
                    onChange={(e) => setColorPaletteUrl(e.target.value)}
                    style={{ 
                      ...styles.input, 
                      flex: 1,
                      fontSize: "14px"
                    }}
                  />
                  <button
                    onClick={applyColorPalette}
                    style={{
                      ...styles.button("primary"),
                      backgroundColor: "#007aff",
                      padding: "12px 20px",
                      whiteSpace: "nowrap",
                      fontSize: "14px"
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div style={{ 
                backgroundColor: "#f9f9f9", 
                padding: "16px", 
                borderRadius: "8px",
                border: "1px solid #e5e5e7"
              }}>
                <div style={{ fontSize: "14px", color: "#6e6e73", marginBottom: "8px" }}>
                  Example URLs:
                </div>
                <div style={{ fontSize: "13px", color: "#86868b", fontFamily: "monospace" }}>
                  https://coolors.co/palette/8ecae6-219ebc-023047-ffb703-fb8500<br/>
                  https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51<br/>
                  https://coolors.co/palette/f72585-b5179e-7209b7-480ca8-3a0ca3
                </div>
              </div>
            </div>

            {customColors.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#1d1d1f" }}>
                  Current Palette ({customColors.length} colors)
                </div>
                <div style={{ 
                  display: "flex", 
                  gap: "8px", 
                  flexWrap: "wrap",
                  backgroundColor: "#f9f9f9",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e5e5e7"
                }}>
                  {customColors.map((color, index) => (
                    <div
                      key={`color-${color}-${index}`}
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: color,
                        borderRadius: "6px",
                        border: "2px solid white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: "#666",
                        fontWeight: "500"
                      }}
                      title={color}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "13px", color: "#6e6e73", marginTop: "8px" }}>
                  Colors are applied to items in order. Click color dots on income/expense items to cycle through the palette.
                </div>
              </div>
            )}

            {customColors.length === 0 && (
              <div style={{ 
                backgroundColor: "#f9f9f9", 
                padding: "16px", 
                borderRadius: "8px",
                border: "1px solid #e5e5e7",
                marginBottom: "24px"
              }}>
                <div style={{ fontSize: "14px", color: "#6e6e73", marginBottom: "8px" }}>
                  Default Pastel Palette (20 colors)
                </div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>                  {defaultPastelColors.map((color, index) => (
                    <div
                      key={`default-${color}`}
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: color,
                        borderRadius: "4px",
                        border: "1px solid #e5e5e7"
                      }}
                      title={color}
                    />
                  ))}
                </div>
                <div style={{ fontSize: "13px", color: "#6e6e73" }}>
                  Add a Coolors URL above to use custom colors instead.
                </div>
              </div>
            )}

            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              gap: "12px",
              borderTop: "1px solid #e5e5e7",
              paddingTop: "16px"
            }}>
              {customColors.length > 0 && (                <button
                  onClick={() => {
                    setCustomColors([]);
                    setColorPaletteUrl("");
                    // Reset all additional items to use default pastel colors
                    setAdditionalIncomes(prev => prev.map((income, index) => ({
                      ...income,
                      color: defaultPastelColors[index % defaultPastelColors.length]
                    })));
                    setAdditionalExpenses(prev => prev.map((expense, index) => ({
                      ...expense,
                      color: defaultPastelColors[index % defaultPastelColors.length]
                    })));
                  }}
                  style={{
                    ...styles.button("secondary"),
                    backgroundColor: "#f2f2f7",
                    color: "#1d1d1f"
                  }}
                >
                  Reset to Default
                </button>
              )}
              <button
                onClick={() => setIsColorSettingsOpen(false)}
                style={{
                  ...styles.button("primary"),
                  backgroundColor: "#007aff"
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;