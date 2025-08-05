import React, { useState, useEffect, useCallback } from "react";
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
  },  closeButtonContainer: {
    marginTop: "20px",
  },
  customCheckbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#007aff",
    transform: "scale(1.2)",
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
  const [activeTab, setActiveTab] = useState("line");  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);  const [transactionDialog, setTransactionDialog] = useState({ isOpen: false, transactions: [] });
  const [transactionCategories, setTransactionCategories] = useState({});  const [autoCategorizeModal, setAutoCategorizeModal] = useState({ 
    isOpen: false, 
    targetTransaction: null, 
    similarTransactions: [], 
    filteredSimilarTransactions: [],
    categoryType: '', 
    categoryId: '', 
    selectedTransactions: new Set(),
    filters: {
      dateRange: 'all', // 'all', 'before', 'after'
      category: 'all' // 'all', 'uncategorized', 'categorized'
    }
  });
  const [additionalExpenses, setAdditionalExpenses] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");  const [additionalIncomes, setAdditionalIncomes] = useState([]);
  const [newIncomeName, setNewIncomeName] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeCategory, setNewIncomeCategory] = useState("");  const [incomeCategories, setIncomeCategories] = useState([]);
  const [newIncomeCategoryName, setNewIncomeCategoryName] = useState("");  const [expenseCategories, setExpenseCategories] = useState([]);
  const [newExpenseCategoryName, setNewExpenseCategoryName] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [editingIncomeCategory, setEditingIncomeCategory] = useState(null);
  const [editingExpenseCategory, setEditingExpenseCategory] = useState(null);const [colorPaletteUrl, setColorPaletteUrl] = useState("");
  const [customColors, setCustomColors] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  // Default pastel color palette for both income and expenses
  const defaultPastelColors = [
    "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
    "#D4BAE8", "#F8D7DA", "#E2F0CB", "#B3E5FC", "#FFCCCB",
    "#F0E68C", "#DDA0DD", "#98FB98", "#F5DEB3", "#FFE4E1",
    "#E6E6FA", "#FFF8DC", "#B0E0E6", "#FFDAB9", "#EEE8AA"
  ];
  // Local Storage functions
  const STORAGE_KEY = 'finance-helper-data';  const saveToLocalStorage = useCallback(() => {
    const dataToSave = {
      transactions,
      additionalIncomes,
      additionalExpenses,
      incomeCategories,
      expenseCategories,
      customColors,
      colorPaletteUrl,
      transactionCategories,
      savedAt: new Date().toISOString()
    };
    
    try {
      setIsSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
      console.log('Data saved to localStorage');
      setTimeout(() => setIsSaving(false), 300); // Brief saving indicator
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      setIsSaving(false);
    }
  }, [transactions, additionalIncomes, additionalExpenses, incomeCategories, expenseCategories, customColors, colorPaletteUrl, transactionCategories]);  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setTransactions([]);
      setFilteredData([]);
      setAdditionalIncomes([]);
      setAdditionalExpenses([]);
      setIncomeCategories([]);
      setExpenseCategories([]);
      setCustomColors([]);
      setColorPaletteUrl("");
      setTransactionCategories({});
      setLastSaved(null);
      console.log('All data cleared');
    }
  };
  const exportData = () => {
    const dataToExport = {
      transactions,
      additionalIncomes,
      additionalExpenses,
      incomeCategories,
      expenseCategories,
      customColors,
      colorPaletteUrl,
      transactionCategories,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-helper-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.version) {
          alert('Invalid backup file format');
          return;
        }
        
        if (window.confirm('This will replace all current data. Are you sure you want to continue?')) {
          // Restore transactions (convert date strings back to Date objects)
          if (importedData.transactions && Array.isArray(importedData.transactions)) {
            const restoredTransactions = importedData.transactions.map(t => ({
              ...t,
              date: new Date(t.date)
            }));
            setTransactions(restoredTransactions);
            setFilteredData(restoredTransactions);
          }
            // Restore other data
          if (importedData.additionalIncomes) setAdditionalIncomes(importedData.additionalIncomes);
          if (importedData.additionalExpenses) setAdditionalExpenses(importedData.additionalExpenses);
          if (importedData.incomeCategories) setIncomeCategories(importedData.incomeCategories);
          if (importedData.expenseCategories) setExpenseCategories(importedData.expenseCategories);
          if (importedData.customColors) setCustomColors(importedData.customColors);
          if (importedData.colorPaletteUrl) setColorPaletteUrl(importedData.colorPaletteUrl);
          if (importedData.transactionCategories) setTransactionCategories(importedData.transactionCategories);
          
          alert('Data imported successfully!');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Restore transactions (convert date strings back to Date objects)
        if (parsedData.transactions && Array.isArray(parsedData.transactions)) {
          const restoredTransactions = parsedData.transactions.map(t => ({
            ...t,
            date: new Date(t.date)
          }));
          setTransactions(restoredTransactions);
          setFilteredData(restoredTransactions);
        }
        
        // Restore additional incomes
        if (parsedData.additionalIncomes && Array.isArray(parsedData.additionalIncomes)) {
          setAdditionalIncomes(parsedData.additionalIncomes);
        }
        
        // Restore additional expenses
        if (parsedData.additionalExpenses && Array.isArray(parsedData.additionalExpenses)) {
          setAdditionalExpenses(parsedData.additionalExpenses);
        }
        
        // Restore income categories
        if (parsedData.incomeCategories && Array.isArray(parsedData.incomeCategories)) {
          setIncomeCategories(parsedData.incomeCategories);
        }
        
        // Restore expense categories
        if (parsedData.expenseCategories && Array.isArray(parsedData.expenseCategories)) {
          setExpenseCategories(parsedData.expenseCategories);
        }
          // Restore custom colors
        if (parsedData.customColors && Array.isArray(parsedData.customColors)) {
          setCustomColors(parsedData.customColors);
        }
          // Restore color palette URL
        if (parsedData.colorPaletteUrl) {
          setColorPaletteUrl(parsedData.colorPaletteUrl);
        }
        
        // Restore transaction categories
        if (parsedData.transactionCategories) {
          setTransactionCategories(parsedData.transactionCategories);
        }
        
        // Set last saved time
        if (parsedData.savedAt) {
          setLastSaved(new Date(parsedData.savedAt));
        }
        
        console.log('Data loaded from localStorage');
        return true;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return false;
  };
  // Load data on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);
  
  // Function to categorize a transaction
  const categorizeTransaction = (transactionId, categoryType, categoryId) => {
    setTransactionCategories(prev => ({
      ...prev,
      [transactionId]: { categoryType, categoryId }
    }));
  };

  // Function to get available categories for a transaction (income or expense)
  const getAvailableCategoriesForTransaction = (transaction) => {
    const isIncome = transaction.credit > 0;
    return isIncome ? incomeCategories : expenseCategories;
  };  // Function to generate a unique transaction ID
  const generateTransactionId = (transaction) => {
    return `${transaction.date.getTime()}-${transaction.description}-${transaction.debit || transaction.credit}`;
  };
  // Function to calculate category stats (monthly average and all-time total)
  const calculateCategoryStats = (categoryId, isIncome = false) => {
    let totalAmount = 0;
    let monthsWithTransactions = 0;
    
    ratioMonths.forEach((month) => {
      const [year, monthNum] = month.split("-");
      const monthTransactions = transactions.filter((t) => {
        const transactionYear = t.date.getFullYear();
        const transactionMonth = t.date.getMonth() + 1;
        return transactionYear === parseInt(year) && transactionMonth === parseInt(monthNum) && 
               (isIncome ? t.credit > 0 : t.debit > 0);
      });
      
      const categoryTotal = monthTransactions.reduce((sum, t) => {
        const transactionId = generateTransactionId(t);
        const categoryData = transactionCategories[transactionId];
        if (categoryData?.categoryId === categoryId.toString()) {
          return sum + (isIncome ? t.credit : t.debit);
        }
        return sum;
      }, 0);
      
      if (categoryTotal > 0) {
        totalAmount += categoryTotal;
        monthsWithTransactions += 1;
      }
    });
    
    const monthlyAverage = monthsWithTransactions > 0 ? totalAmount / monthsWithTransactions : 0;
    
    return {
      total: totalAmount,
      monthlyAverage: monthlyAverage
    };
  };

  // Function to handle category name editing
  const handleCategoryNameEdit = (categoryId, newName, isIncome = false) => {
    if (!newName.trim()) return;
    
    if (isIncome) {
      setIncomeCategories(incomeCategories.map(cat => 
        cat.id === categoryId ? { ...cat, name: newName.trim() } : cat
      ));
      setEditingIncomeCategory(null);
    } else {
      setExpenseCategories(expenseCategories.map(cat => 
        cat.id === categoryId ? { ...cat, name: newName.trim() } : cat
      ));
      setEditingExpenseCategory(null);
    }
  };  // Function to find transactions by first word of description
  const findTransactionsByFirstWord = (targetTransaction) => {
    const targetDesc = targetTransaction.description.toLowerCase().trim();
    const firstWord = targetDesc.split(' ')[0];
    
    // Skip if first word is too short or common
    if (firstWord.length < 3 || ['the', 'and', 'for', 'with', 'from', 'to'].includes(firstWord)) {
      return [];
    }
    
    return transactions.filter(t => {
      const desc = t.description.toLowerCase().trim();
      const transactionFirstWord = desc.split(' ')[0];
      return transactionFirstWord === firstWord && t !== targetTransaction;
    });
  };  // Function to filter similar transactions based on modal filters
  const applyFiltersToSimilarTransactions = (transactions, targetTransaction, filters) => {
    const { dateRange, category } = filters;
    const targetDate = targetTransaction.date;
    
    let filtered = [...transactions];
    
    // Apply date filter
    if (dateRange === 'before') {
      filtered = filtered.filter(t => t.date < targetDate);
    } else if (dateRange === 'after') {
      filtered = filtered.filter(t => t.date > targetDate);
    }
    
    // Apply category filter
    if (category === 'uncategorized') {
      filtered = filtered.filter(t => {
        const transactionId = generateTransactionId(t);
        return !transactionCategories[transactionId];
      });
    } else if (category === 'categorized') {
      filtered = filtered.filter(t => {
        const transactionId = generateTransactionId(t);
        return !!transactionCategories[transactionId];
      });
    }
    
    return filtered;
  };

  // Function to auto-categorize similar transactions
  const autoCategorizeTransactions = (targetTransaction, categoryType, categoryId) => {
    const similarTransactions = findTransactionsByFirstWord(targetTransaction);
    
    if (similarTransactions.length > 0) {
      // Apply initial filters
      const filteredTransactions = applyFiltersToSimilarTransactions(
        similarTransactions, 
        targetTransaction, 
        { dateRange: 'all', category: 'all' }
      );
      
      // Open the modal with similar transactions
      const initialSelectedTransactions = new Set();
      filteredTransactions.forEach(t => {
        const transactionId = generateTransactionId(t);
        initialSelectedTransactions.add(transactionId);
      });
      
      setAutoCategorizeModal({
        isOpen: true,
        targetTransaction,
        similarTransactions,
        filteredSimilarTransactions: filteredTransactions,
        categoryType,
        categoryId,
        selectedTransactions: initialSelectedTransactions,
        filters: {
          dateRange: 'all',
          category: 'all'
        }
      });
      
      return true; // Indicate that we're handling this with the modal
    }
    return false;
  };

  // Function to update filters in auto-categorization modal
  const updateAutoCategorizeFilters = (newFilters) => {
    const { targetTransaction, similarTransactions } = autoCategorizeModal;
    const filteredTransactions = applyFiltersToSimilarTransactions(
      similarTransactions, 
      targetTransaction, 
      newFilters
    );
    
    // Update selected transactions to only include those that pass the filter
    const newSelectedTransactions = new Set();
    filteredTransactions.forEach(t => {
      const transactionId = generateTransactionId(t);
      if (autoCategorizeModal.selectedTransactions.has(transactionId)) {
        newSelectedTransactions.add(transactionId);
      }
    });
    
    setAutoCategorizeModal(prev => ({
      ...prev,
      filteredSimilarTransactions: filteredTransactions,
      selectedTransactions: newSelectedTransactions,
      filters: newFilters
    }));
  };

  // Function to apply categorization to selected transactions from modal
  const applyAutoCategorization = () => {
    const { selectedTransactions, categoryType, categoryId, targetTransaction } = autoCategorizeModal;
    
    const newCategories = { ...transactionCategories };
    
    // Always categorize the target transaction
    const targetTransactionId = generateTransactionId(targetTransaction);
    newCategories[targetTransactionId] = { categoryType, categoryId };
    
    // Only categorize selected similar transactions if any are selected
    if (selectedTransactions.size > 0) {
      selectedTransactions.forEach(transactionId => {
        newCategories[transactionId] = { categoryType, categoryId };
      });
    }
    
    setTransactionCategories(newCategories);
    closeAutoCategorizeModal();
  };

  // Function to skip auto-categorization (only categorize target transaction)
  const skipAutoCategorization = () => {
    const { categoryType, categoryId, targetTransaction } = autoCategorizeModal;
    
    const newCategories = { ...transactionCategories };
    
    // Only categorize the target transaction
    const targetTransactionId = generateTransactionId(targetTransaction);
    newCategories[targetTransactionId] = { categoryType, categoryId };
    
    setTransactionCategories(newCategories);
    closeAutoCategorizeModal();
  };
  // Function to close auto-categorization modal
  const closeAutoCategorizeModal = () => {
    setAutoCategorizeModal({ 
      isOpen: false, 
      targetTransaction: null, 
      similarTransactions: [], 
      filteredSimilarTransactions: [],
      categoryType: '', 
      categoryId: '', 
      selectedTransactions: new Set(),
      filters: {
        dateRange: 'all',
        category: 'all'
      }
    });
  };// Save data whenever important state changes
  useEffect(() => {
    // Don't save immediately on mount, wait for user interactions
    if (transactions.length > 0 || additionalIncomes.length > 0 || additionalExpenses.length > 0 || 
        incomeCategories.length > 0 || expenseCategories.length > 0 || customColors.length > 0 ||
        Object.keys(transactionCategories).length > 0) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage();
      }, 500); // Debounce saves to avoid excessive writes
      
      return () => clearTimeout(timeoutId);
    }
  }, [transactions, additionalIncomes, additionalExpenses, incomeCategories, expenseCategories, customColors, colorPaletteUrl, transactionCategories, saveToLocalStorage]);

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
  };  // Function to apply Coolors palette
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

      setIncomeCategories(prev => prev.map((category, index) => ({
        ...category,
        color: colors[(itemStartIndex + additionalIncomes.length + index) % colors.length]
      })));
      
      setAdditionalExpenses(prev => prev.map((expense, index) => ({
        ...expense,
        color: colors[(itemStartIndex + additionalIncomes.length + incomeCategories.length + index) % colors.length]
      })));

      setExpenseCategories(prev => prev.map((category, index) => ({
        ...category,
        color: colors[(itemStartIndex + additionalIncomes.length + incomeCategories.length + additionalExpenses.length + index) % colors.length]
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
        category: newExpenseCategory || null,
        color: currentPalette[colorIndex]
      };
      setAdditionalExpenses([...additionalExpenses, expense]);
      setNewExpenseName("");
      setNewExpenseAmount("");
      setNewExpenseCategory("");
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
        category: newIncomeCategory || null,
        color: currentPalette[colorIndex]
      };
      setAdditionalIncomes([...additionalIncomes, income]);
      setNewIncomeName("");
      setNewIncomeAmount("");
      setNewIncomeCategory("");
    }
  };const removeIncome = (id) => {
    setAdditionalIncomes(additionalIncomes.filter(inc => inc.id !== id));
  };
  const addIncomeCategory = () => {
    if (newIncomeCategoryName) {
      const currentPalette = getCurrentColorPalette();
      const colorIndex = incomeCategories.length % currentPalette.length;
      
      const category = {
        id: Date.now(),
        name: newIncomeCategoryName,
        color: currentPalette[colorIndex]
      };
      setIncomeCategories([...incomeCategories, category]);
      setNewIncomeCategoryName("");
    }
  };
  const removeIncomeCategory = (id) => {
    // Remove the category
    setIncomeCategories(incomeCategories.filter(cat => cat.id !== id));
    
    // Remove category assignments from additional income items
    setAdditionalIncomes(additionalIncomes.map(income => 
      income.category === id.toString() ? { ...income, category: null } : income
    ));
    
    // Remove category assignments from transactions
    setTransactionCategories(prev => {
      const newCategories = { ...prev };
      Object.keys(newCategories).forEach(transactionId => {
        if (newCategories[transactionId].categoryId === id.toString()) {
          delete newCategories[transactionId];
        }
      });
      return newCategories;
    });
  };
  const addExpenseCategory = () => {
    if (newExpenseCategoryName) {
      const currentPalette = getCurrentColorPalette();
      const colorIndex = expenseCategories.length % currentPalette.length;
      
      const category = {
        id: Date.now(),
        name: newExpenseCategoryName,
        color: currentPalette[colorIndex]
      };
      setExpenseCategories([...expenseCategories, category]);
      setNewExpenseCategoryName("");
    }
  };
  const removeExpenseCategory = (id) => {
    // Remove the category
    setExpenseCategories(expenseCategories.filter(cat => cat.id !== id));
    
    // Remove category assignments from additional expense items
    setAdditionalExpenses(additionalExpenses.map(expense => 
      expense.category === id.toString() ? { ...expense, category: null } : expense
    ));
    
    // Remove category assignments from transactions
    setTransactionCategories(prev => {
      const newCategories = { ...prev };
      Object.keys(newCategories).forEach(transactionId => {
        if (newCategories[transactionId].categoryId === id.toString()) {
          delete newCategories[transactionId];
        }
      });
      return newCategories;
    });
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

  const cycleIncomeCategoryColor = (id) => {
    setIncomeCategories(incomeCategories.map(category => {
      if (category.id === id) {
        const currentPalette = getCurrentColorPalette();
        const currentIndex = currentPalette.indexOf(category.color);
        const nextIndex = (currentIndex + 1) % currentPalette.length;
        return { ...category, color: currentPalette[nextIndex] };
      }
      return category;
    }));
  };

  const cycleExpenseCategoryColor = (id) => {
    setExpenseCategories(expenseCategories.map(category => {
      if (category.id === id) {
        const currentPalette = getCurrentColorPalette();
        const currentIndex = currentPalette.indexOf(category.color);
        const nextIndex = (currentIndex + 1) % currentPalette.length;
        return { ...category, color: currentPalette[nextIndex] };
      }
      return category;
    }));
  };

  const dailyData = calculateDailyData();  const dailyDates = Object.keys(dailyData).sort((a, b) => a.localeCompare(b));
  const dailyBalances = dailyDates.map((date) => dailyData[date].balance);  const monthlyRatios = calculateMonthlyRatios();
  const ratioMonths = Object.keys(monthlyRatios).sort((a, b) => a.localeCompare(b));  // Calculate average leftover per month
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
  };// Create datasets for the bar chart showing actual income vs expenses side by side
  const createBarChartDatasets = () => {
    const datasets = [];
    const currentPalette = getCurrentColorPalette();    // Bank Income - Use first color from palette or default green (excluding categorized transactions)
    const bankIncomeData = ratioMonths.map((month) => {
      const [year, monthNum] = month.split("-");
      const monthTransactions = transactions.filter((t) => {
        const transactionYear = t.date.getFullYear();
        const transactionMonth = t.date.getMonth() + 1;
        return transactionYear === parseInt(year) && transactionMonth === parseInt(monthNum) && t.credit > 0;
      });
      
      // Calculate uncategorized income for this month
      const uncategorizedIncome = monthTransactions.reduce((sum, t) => {
        const transactionId = generateTransactionId(t);
        const categoryData = transactionCategories[transactionId];
        // Only count if not categorized
        if (!categoryData) {
          return sum + t.credit;
        }
        return sum;
      }, 0);
      
      return uncategorizedIncome;
    });
    datasets.push({
      label: 'Bank Income (Uncategorized)',
      data: bankIncomeData,
      backgroundColor: customColors.length > 0 ? currentPalette[0] : '#34c759',
      borderColor: 'white',
      borderWidth: 2,
      stack: 'income',
    });

    // Individual Additional Incomes - Each with their own color (stacked on top of bank income)
    additionalIncomes.forEach((income) => {
      const incomeData = ratioMonths.map(() => income.amount);
      const categoryName = income.category ? 
        incomeCategories.find(cat => cat.id.toString() === income.category)?.name : null;
      
      datasets.push({
        label: categoryName ? `${income.name} (${categoryName})` : income.name,
        data: incomeData,
        backgroundColor: income.color,
        borderColor: 'white',
        borderWidth: 2,
        stack: 'income',
      });
    });    // Helper function to calculate total income for a category across all months
    const calculateIncomeCategoryTotal = (category) => {
      return ratioMonths.reduce((total, month) => {
        const [year, monthNum] = month.split("-");
        const monthTransactions = transactions.filter((t) => {
          const transactionYear = t.date.getFullYear();
          const transactionMonth = t.date.getMonth() + 1;
          return transactionYear === parseInt(year) && transactionMonth === parseInt(monthNum) && t.credit > 0;
        });
        
        const categoryTotal = monthTransactions.reduce((sum, t) => {
          const transactionId = generateTransactionId(t);
          const categoryData = transactionCategories[transactionId];
          if (categoryData?.categoryId === category.id.toString()) {
            return sum + t.credit;
          }
          return sum;
        }, 0);
        
        return total + categoryTotal;
      }, 0);
    };

    // Sort income categories by total amount (highest first)
    const sortedIncomeCategories = [...incomeCategories].sort((a, b) => {
      const totalA = calculateIncomeCategoryTotal(a);
      const totalB = calculateIncomeCategoryTotal(b);
      return totalB - totalA;
    });

    // Categorized Bank Income Transactions - Group by category (sorted by total amount)
    sortedIncomeCategories.forEach((category) => {
      const categoryTotal = calculateIncomeCategoryTotal(category);
      
      // Only show categories that have transactions
      if (categoryTotal > 0) {
        const categoryIncomeData = ratioMonths.map((month) => {
          const [year, monthNum] = month.split("-");
          const monthTransactions = transactions.filter((t) => {
            const transactionYear = t.date.getFullYear();
            const transactionMonth = t.date.getMonth() + 1;
            return transactionYear === parseInt(year) && transactionMonth === parseInt(monthNum) && t.credit > 0;
          });
          
          // Sum up transactions categorized to this category
          const categoryMonthTotal = monthTransactions.reduce((sum, t) => {
            const transactionId = generateTransactionId(t);
            const categoryData = transactionCategories[transactionId];
            if (categoryData?.categoryId === category.id.toString()) {
              return sum + t.credit;
            }
            return sum;
          }, 0);
          
          return categoryMonthTotal;
        });
        
        datasets.push({
          label: `${category.name} (${categoryTotal.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })} total)`,
          data: categoryIncomeData,
          backgroundColor: category.color,
          borderColor: 'white',
          borderWidth: 2,
          stack: 'income',
        });
      }
    });// Bank Expenses - Use second color from palette or default red (excluding categorized transactions)
    const bankExpenseData = ratioMonths.map((month) => {
      const [year, monthNum] = month.split("-");
      const monthTransactions = transactions.filter((t) => {
        const transactionYear = t.date.getFullYear();
        const transactionMonth = t.date.getMonth() + 1;
        return transactionYear === parseInt(year) && transactionMonth === parseInt(monthNum) && t.debit > 0;
      });
      
      // Calculate uncategorized expenses for this month
      const uncategorizedExpenses = monthTransactions.reduce((sum, t) => {
        const transactionId = generateTransactionId(t);
        const categoryData = transactionCategories[transactionId];
        // Only count if not categorized
        if (!categoryData) {
          return sum + t.debit;
        }
        return sum;
      }, 0);
      
      return uncategorizedExpenses;
    });
    datasets.push({
      label: 'Bank Expenses (Uncategorized)',
      data: bankExpenseData,
      backgroundColor: customColors.length > 1 ? currentPalette[1] : '#ff3b30',
      borderColor: 'white',
      borderWidth: 2,
      stack: 'expenses',
    });

    // Individual Additional Expenses - Each with their own color (stacked on top of bank expenses)
    additionalExpenses.forEach((expense) => {
      const expenseData = ratioMonths.map(() => expense.amount);
      const categoryName = expense.category ? 
        expenseCategories.find(cat => cat.id.toString() === expense.category)?.name : null;
      
      datasets.push({
        label: categoryName ? `${expense.name} (${categoryName})` : expense.name,
        data: expenseData,
        backgroundColor: expense.color,
        borderColor: 'white',
        borderWidth: 2,
        stack: 'expenses',
      });
    });    // Helper function to calculate total expense for a category across all months
    const calculateCategoryTotal = (category) => {
      return ratioMonths.reduce((total, month) => {
        const [year, monthNum] = month.split("-");
        const monthTransactions = transactions.filter((t) => {
          const transactionYear = t.date.getFullYear();
          const transactionMonth = t.date.getMonth() + 1;
          return transactionYear === parseInt(year) && transactionMonth === parseInt(monthNum) && t.debit > 0;
        });
        
        const categoryTotal = monthTransactions.reduce((sum, t) => {
          const transactionId = generateTransactionId(t);
          const categoryData = transactionCategories[transactionId];
          if (categoryData?.categoryId === category.id.toString()) {
            return sum + t.debit;
          }
          return sum;
        }, 0);
        
        return total + categoryTotal;
      }, 0);
    };

    // Sort expense categories by total cost (highest first)
    const sortedExpenseCategories = [...expenseCategories].sort((a, b) => {
      const totalA = calculateCategoryTotal(a);
      const totalB = calculateCategoryTotal(b);
      return totalB - totalA;
    });

    // Categorized Bank Expense Transactions - Group by category (sorted by total cost)
    sortedExpenseCategories.forEach((category) => {
      const categoryTotal = calculateCategoryTotal(category);
      
      // Only show categories that have transactions
      if (categoryTotal > 0) {
        const categoryExpenseData = ratioMonths.map((month) => {
          const [year, monthNum] = month.split("-");
          const monthTransactions = transactions.filter((t) => {
            const transactionYear = t.date.getFullYear();
            const transactionMonth = t.date.getMonth() + 1;
            return transactionYear === parseInt(year) && transactionMonth === parseInt(monthNum) && t.debit > 0;
          });
          
          // Sum up transactions categorized to this category
          const categoryMonthTotal = monthTransactions.reduce((sum, t) => {
            const transactionId = generateTransactionId(t);
            const categoryData = transactionCategories[transactionId];
            if (categoryData?.categoryId === category.id.toString()) {
              return sum + t.debit;
            }
            return sum;
          }, 0);
          
          return categoryMonthTotal;
        });
        
        datasets.push({
          label: `${category.name} (${categoryTotal.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })} total)`,
          data: categoryExpenseData,
          backgroundColor: category.color,
          borderColor: 'white',
          borderWidth: 2,
          stack: 'expenses',
        });
      }
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

    // Calculate the total number of income datasets (Bank Income + Additional Incomes + Income Categories with transactions)
    const totalIncomeDatasets = 1 + additionalIncomes.length + incomeCategories.length;
    
    if (datasetIndex < totalIncomeDatasets) {
      // Income clicked (bank, additional, or categorized transactions)
      const incomeTransactions = transactionsForMonth.filter((t) => t.credit > 0);
      setTransactionDialog({ isOpen: true, transactions: incomeTransactions });
    } else {
      // Expenses clicked (bank, additional, or categorized transactions)
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
      <div style={styles.header}>        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={styles.greeting}>Hi there!</div>
            <div style={styles.subtitle}>What would you like to know?</div>
            <div style={styles.description}>
              Use one of the most common prompts below or use your own to begin
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
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
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              title="Color Settings"
            >
              ⚙️ Colors
            </button>
              {/* Data Management */}
            <div style={{ 
              backgroundColor: "white", 
              border: "1px solid #e5e5e7", 
              borderRadius: "8px", 
              padding: "12px 16px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              fontSize: "13px",
              textAlign: "right",
              minWidth: "200px"
            }}>              <div style={{ marginBottom: "10px", color: "#1d1d1f", fontWeight: "500" }}>
                💾 Data Management
              </div>
              {isSaving && (
                <div style={{ color: "#007aff", marginBottom: "8px", fontSize: "12px" }}>
                  💾 Saving...
                </div>
              )}
              {lastSaved && !isSaving && (
                <div style={{ color: "#34c759", marginBottom: "8px" }}>
                  ✓ Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <button
                  onClick={exportData}
                  style={{
                    backgroundColor: "#007aff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#0056cc"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#007aff"}
                  title="Export all data as backup file"
                >
                  📤 Export Data
                </button>
                
                <label style={{
                  backgroundColor: "#34c759",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  display: "inline-block"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#28a745"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#34c759"}
                title="Import data from backup file">
                  📥 Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => e.target.files[0] && importData(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </label>
                
                <button
                  onClick={clearAllData}
                  style={{
                    backgroundColor: "#ff3b30",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#d70015"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#ff3b30"}
                  title="Clear all saved data"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>
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
        <div style={styles.rightPanel}>          <div style={styles.chartTitle}>Income & Expense Management</div>
          <div style={styles.description}>
            Create categories to organize your finances, then add individual income and expense items to those categories to see how they impact your budget
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
            )}              {/* Additional income/expenses */}
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
              <select
                value={newIncomeCategory}
                onChange={(e) => setNewIncomeCategory(e.target.value)}
                style={{ ...styles.input, marginBottom: "8px" }}
              >
                <option value="">No Category</option>
                {incomeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
                        {income.category && (
                          <span style={{ marginLeft: "8px", fontStyle: "italic" }}>
                            • {incomeCategories.find(cat => cat.id.toString() === income.category)?.name || "Unknown Category"}
                          </span>
                        )}
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
            </div>{additionalIncomes.length === 0 && (
              <div style={{ textAlign: "center", color: "#6e6e73", marginTop: "16px", fontSize: "14px" }}>
                No additional income added yet
              </div>
            )}
          </div>          {/* Income Categories Section */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ marginBottom: "12px", color: "#34c759" }}>Income Categories</h4>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Category name (e.g., 'Freelance', 'Investments')"
                value={newIncomeCategoryName}
                onChange={(e) => setNewIncomeCategoryName(e.target.value)}
                style={{ ...styles.input, marginBottom: "8px" }}
              />
              <button
                onClick={addIncomeCategory}
                style={{ ...styles.button("primary"), backgroundColor: "#34c759" }}
              >
                Add Category
              </button>
            </div>            <div style={styles.expenseList}>
              {incomeCategories.map((category) => {
                const stats = calculateCategoryStats(category.id, true);
                return (
                  <div key={category.id} style={styles.expenseItem}>
                    <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <div
                        style={{
                          ...styles.expenseColor,
                          backgroundColor: category.color,
                        }}
                        onClick={() => cycleIncomeCategoryColor(category.id)}
                        title="Click to cycle through colors"
                      />
                      <div style={{ flex: 1 }}>
                        {editingIncomeCategory === category.id ? (
                          <input
                            type="text"
                            defaultValue={category.name}
                            onBlur={(e) => handleCategoryNameEdit(category.id, e.target.value, true)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCategoryNameEdit(category.id, e.target.value, true);
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            autoFocus
                            style={{
                              ...styles.input,
                              fontSize: "14px",
                              padding: "4px 8px",
                              margin: 0,
                              backgroundColor: "white",
                              border: "1px solid #007aff"
                            }}
                          />
                        ) : (
                          <div
                            style={{ fontWeight: "500", cursor: "pointer" }}
                            onClick={() => setEditingIncomeCategory(category.id)}
                            title="Click to edit category name"
                          >
                            {category.name}
                          </div>
                        )}
                        <div style={{ color: "#6e6e73", fontSize: "12px", marginTop: "2px" }}>
                          {stats.total > 0 ? (
                            <>
                              All-time: +{stats.total.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })} • Avg: +{stats.monthlyAverage.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}/month
                            </>
                          ) : (
                            "Category Container (No transactions yet)"
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeIncomeCategory(category.id)}
                      style={styles.deleteButton}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            {incomeCategories.length === 0 && (
              <div style={{ textAlign: "center", color: "#6e6e73", marginTop: "16px", fontSize: "14px" }}>
                No income categories added yet
              </div>
            )}
          </div>          {/* Expenses Section */}
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
              <select
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                style={{ ...styles.input, marginBottom: "8px" }}
              >
                <option value="">No Category</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
                        {expense.category && (
                          <span style={{ marginLeft: "8px", fontStyle: "italic" }}>
                            • {expenseCategories.find(cat => cat.id.toString() === expense.category)?.name || "Unknown Category"}
                          </span>
                        )}
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
            </div>{additionalExpenses.length === 0 && (
              <div style={{ textAlign: "center", color: "#6e6e73", marginTop: "16px", fontSize: "14px" }}>
                No additional expenses added yet
              </div>
            )}
          </div>          {/* Expense Categories Section */}
          <div>
            <h4 style={{ marginBottom: "12px", color: "#ff3b30" }}>Expense Categories</h4>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Category name (e.g., 'Entertainment', 'Subscriptions')"
                value={newExpenseCategoryName}
                onChange={(e) => setNewExpenseCategoryName(e.target.value)}
                style={{ ...styles.input, marginBottom: "8px" }}
              />
              <button
                onClick={addExpenseCategory}
                style={styles.button("primary")}
              >
                Add Category
              </button>
            </div>            <div style={styles.expenseList}>
              {expenseCategories.map((category) => {
                const stats = calculateCategoryStats(category.id, false);
                return (
                  <div key={category.id} style={styles.expenseItem}>
                    <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <div
                        style={{
                          ...styles.expenseColor,
                          backgroundColor: category.color,
                        }}
                        onClick={() => cycleExpenseCategoryColor(category.id)}
                        title="Click to cycle through colors"
                      />
                      <div style={{ flex: 1 }}>
                        {editingExpenseCategory === category.id ? (
                          <input
                            type="text"
                            defaultValue={category.name}
                            onBlur={(e) => handleCategoryNameEdit(category.id, e.target.value, false)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCategoryNameEdit(category.id, e.target.value, false);
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            autoFocus
                            style={{
                              ...styles.input,
                              fontSize: "14px",
                              padding: "4px 8px",
                              margin: 0,
                              backgroundColor: "white",
                              border: "1px solid #007aff"
                            }}
                          />
                        ) : (
                          <div
                            style={{ fontWeight: "500", cursor: "pointer" }}
                            onClick={() => setEditingExpenseCategory(category.id)}
                            title="Click to edit category name"
                          >
                            {category.name}
                          </div>
                        )}
                        <div style={{ color: "#6e6e73", fontSize: "12px", marginTop: "2px" }}>
                          {stats.total > 0 ? (
                            <>
                              All-time: -{stats.total.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })} • Avg: -{stats.monthlyAverage.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}/month
                            </>
                          ) : (
                            "Category Container (No transactions yet)"
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExpenseCategory(category.id)}
                      style={styles.deleteButton}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            {expenseCategories.length === 0 && (
              <div style={{ textAlign: "center", color: "#6e6e73", marginTop: "16px", fontSize: "14px" }}>
                No expense categories added yet
              </div>
            )}
          </div>
        </div>
      </div>      {transactionDialog.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: "1000px"}}>
            <h3>Transaction Categorization</h3>
            <div style={{ 
              fontSize: "14px", 
              color: "#6e6e73", 
              marginBottom: "20px",
              textAlign: "center"
            }}>
              Categorize your transactions to better organize your finances. Select a category for each transaction.
            </div>
            
            <div style={styles.transactionTableContainer}>
              <table style={styles.transactionTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Date</th>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Description</th>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Amount</th>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Category</th>
                  </tr>
                </thead>
                <tbody>                  {transactionDialog.transactions.map((t) => {
                    const transactionId = generateTransactionId(t);
                    const isIncome = t.credit > 0;
                    const availableCategories = getAvailableCategoriesForTransaction(t);
                    const currentCategory = transactionCategories[transactionId];
                    
                    return (
                      <tr key={transactionId} style={styles.transactionRow}>
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
                            : `+${t.credit.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}`}
                        </td>                        <td style={styles.transactionCell}>
                          <select
                            value={currentCategory?.categoryId || ""}
                            onChange={(e) => {
                              const categoryId = e.target.value;
                              if (categoryId) {
                                // Check for auto-categorization first
                                const autoApplied = autoCategorizeTransactions(t, isIncome ? 'income' : 'expense', categoryId);
                                
                                // If not auto-applied, apply to just this transaction
                                if (!autoApplied) {
                                  categorizeTransaction(transactionId, isIncome ? 'income' : 'expense', categoryId);
                                }
                              } else {
                                // Remove categorization
                                setTransactionCategories(prev => {
                                  const newCategories = { ...prev };
                                  delete newCategories[transactionId];
                                  return newCategories;
                                });
                              }
                            }}                            style={{
                              ...styles.input,
                              fontSize: "12px",
                              padding: "6px 8px",
                              backgroundColor: currentCategory ? "#f9f9f9" : "#fff5f5",
                              border: currentCategory ? "1px solid #e5e5e7" : "1px solid #ff8a80",
                              borderRadius: "4px"
                            }}
                          >                            <option value="">No Category</option>
                            {availableCategories.map((category) => {
                              return (
                                <option 
                                  key={category.id} 
                                  value={category.id}
                                >
                                  {category.name}
                                </option>
                              );
                            })}
                          </select>
                          {currentCategory && (
                            <div style={{
                              fontSize: "10px",
                              color: isIncome ? "#34c759" : "#ff3b30",
                              marginTop: "2px",
                              fontWeight: "500"
                            }}>
                              {isIncome ? "Income" : "Expense"} Category
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Category Summary */}
            <div style={{
              marginTop: "20px",
              backgroundColor: "#f9f9f9",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e5e7"
            }}>
              <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#1d1d1f" }}>
                Categorization Summary
              </div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>                {/* Income Categories */}
                {incomeCategories.length > 0 && (
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#34c759", marginBottom: "8px" }}>
                      Income Categories (sorted by total):
                    </div>
                    {incomeCategories
                      .map(category => {
                        const categorizedTransactions = transactionDialog.transactions.filter(t => {
                          const transactionId = generateTransactionId(t);
                          const categoryData = transactionCategories[transactionId];
                          return categoryData?.categoryId === category.id.toString() && t.credit > 0;
                        });
                        
                        const totalAmount = categorizedTransactions.reduce((sum, t) => sum + t.credit, 0);
                        return { ...category, totalAmount, transactionCount: categorizedTransactions.length };
                      })
                      .filter(category => category.transactionCount > 0)
                      .sort((a, b) => b.totalAmount - a.totalAmount)
                      .map(category => (
                        <div key={category.id} style={{ fontSize: "12px", color: "#6e6e73", marginBottom: "4px" }}>
                          <span style={{ color: category.color, fontWeight: "bold" }}>●</span> {category.name}: {category.transactionCount} transactions (+{category.totalAmount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })})
                        </div>
                      ))}
                  </div>
                )}
                
                {/* Expense Categories */}
                {expenseCategories.length > 0 && (
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#ff3b30", marginBottom: "8px" }}>
                      Expense Categories (sorted by total):
                    </div>
                    {expenseCategories
                      .map(category => {
                        const categorizedTransactions = transactionDialog.transactions.filter(t => {
                          const transactionId = generateTransactionId(t);
                          const categoryData = transactionCategories[transactionId];
                          return categoryData?.categoryId === category.id.toString() && t.debit > 0;
                        });
                        
                        const totalAmount = categorizedTransactions.reduce((sum, t) => sum + t.debit, 0);
                        return { ...category, totalAmount, transactionCount: categorizedTransactions.length };
                      })
                      .filter(category => category.transactionCount > 0)
                      .sort((a, b) => b.totalAmount - a.totalAmount)
                      .map(category => (
                        <div key={category.id} style={{ fontSize: "12px", color: "#6e6e73", marginBottom: "4px" }}>
                          <span style={{ color: category.color, fontWeight: "bold" }}>●</span> {category.name}: {category.transactionCount} transactions (-{category.totalAmount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })})
                        </div>
                      ))}
                  </div>
                )}
              </div>
                {/* Uncategorized Summary */}
              <div style={{ marginTop: "12px", borderTop: "1px solid #e5e5e7", paddingTop: "12px" }}>
                {(() => {
                  const uncategorizedTransactions = transactionDialog.transactions.filter(t => {
                    const transactionId = generateTransactionId(t);
                    return !transactionCategories[transactionId];
                  });
                  const uncategorizedIncome = uncategorizedTransactions
                    .filter(t => t.credit > 0)
                    .reduce((sum, t) => sum + t.credit, 0);
                  const uncategorizedExpenses = uncategorizedTransactions
                    .filter(t => t.debit > 0)
                    .reduce((sum, t) => sum + t.debit, 0);
                  
                  return (
                    <div>
                      <div style={{ fontSize: "12px", color: "#86868b", marginBottom: "4px" }}>
                        Uncategorized: {uncategorizedTransactions.length} of {transactionDialog.transactions.length} transactions
                      </div>
                      {uncategorizedIncome > 0 && (
                        <div style={{ fontSize: "11px", color: "#34c759" }}>
                          • Income: +{uncategorizedIncome.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </div>
                      )}
                      {uncategorizedExpenses > 0 && (
                        <div style={{ fontSize: "11px", color: "#ff3b30" }}>
                          • Expenses: -{uncategorizedExpenses.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
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
        </div>      )}

      {/* Auto-Categorization Modal */}
      {autoCategorizeModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: "800px"}}>
            <h3>Auto-Categorize Similar Transactions</h3>
            <div style={{ 
              fontSize: "14px", 
              color: "#6e6e73", 
              marginBottom: "20px",
              textAlign: "center"
            }}>
              Found transactions with descriptions starting with "<strong>{autoCategorizeModal.targetTransaction?.description.split(' ')[0]}</strong>". Select which transactions to categorize:
            </div>
              <div style={{
              backgroundColor: "#f9f9f9",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e5e7",
              marginBottom: "20px",
              textAlign: "left"
            }}>
              <div style={{ fontWeight: "600", marginBottom: "8px", color: "#1d1d1f" }}>
                Target Transaction:
              </div>
              <div style={{ fontSize: "14px", color: "#6e6e73" }}>
                {autoCategorizeModal.targetTransaction?.date.toLocaleDateString()} • {autoCategorizeModal.targetTransaction?.description} • 
                {autoCategorizeModal.targetTransaction?.debit > 0 
                  ? ` -$${autoCategorizeModal.targetTransaction.debit.toLocaleString("en-US")}`
                  : ` +$${autoCategorizeModal.targetTransaction?.credit.toLocaleString("en-US")}`
                }
              </div>
            </div>

            {/* Filter Controls */}
            <div style={{
              backgroundColor: "#f0f8ff",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #b3d9ff",
              marginBottom: "20px"
            }}>
              <div style={{ fontWeight: "600", color: "#1d1d1f", marginBottom: "12px", fontSize: "14px" }}>
                Filter Similar Transactions:
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#1d1d1f" }}>Date Range:</label>
                  <select
                    value={autoCategorizeModal.filters.dateRange}
                    onChange={(e) => updateAutoCategorizeFilters({
                      ...autoCategorizeModal.filters,
                      dateRange: e.target.value
                    })}
                    style={{
                      ...styles.input,
                      fontSize: "12px",
                      padding: "6px 8px",
                      minWidth: "120px"
                    }}
                  >
                    <option value="all">All Dates</option>
                    <option value="before">Before Target</option>
                    <option value="after">After Target</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#1d1d1f" }}>Category Status:</label>
                  <select
                    value={autoCategorizeModal.filters.category}
                    onChange={(e) => updateAutoCategorizeFilters({
                      ...autoCategorizeModal.filters,
                      category: e.target.value
                    })}
                    style={{
                      ...styles.input,
                      fontSize: "12px",
                      padding: "6px 8px",
                      minWidth: "140px"
                    }}
                  >
                    <option value="all">All Transactions</option>
                    <option value="uncategorized">Uncategorized Only</option>
                    <option value="categorized">Categorized Only</option>
                  </select>
                </div>
                <div style={{ fontSize: "12px", color: "#6e6e73", fontStyle: "italic" }}>
                  Showing {autoCategorizeModal.filteredSimilarTransactions.length} of {autoCategorizeModal.similarTransactions.length} transactions
                </div>
              </div>
            </div>

            <div style={styles.transactionTableContainer}>
              <table style={styles.transactionTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader, width: "50px" }}>                      <input
                        type="checkbox"
                        checked={autoCategorizeModal.selectedTransactions.size === autoCategorizeModal.filteredSimilarTransactions.length && autoCategorizeModal.filteredSimilarTransactions.length > 0}
                        onChange={(e) => {
                          const newSelectedTransactions = new Set();
                          if (e.target.checked) {
                            autoCategorizeModal.filteredSimilarTransactions.forEach(t => {
                              const transactionId = generateTransactionId(t);
                              newSelectedTransactions.add(transactionId);
                            });
                          }
                          setAutoCategorizeModal(prev => ({
                            ...prev,
                            selectedTransactions: newSelectedTransactions
                          }));
                        }}
                        style={styles.customCheckbox}
                      />
                    </th>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Date</th>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Description</th>
                    <th style={{ ...styles.transactionCell, ...styles.transactionHeader }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {autoCategorizeModal.filteredSimilarTransactions.map((t) => {
                    const transactionId = generateTransactionId(t);
                    const isSelected = autoCategorizeModal.selectedTransactions.has(transactionId);
                    
                    return (
                      <tr key={transactionId} style={styles.transactionRow}>
                        <td style={styles.transactionCell}>                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSelectedTransactions = new Set(autoCategorizeModal.selectedTransactions);
                              if (e.target.checked) {
                                newSelectedTransactions.add(transactionId);
                              } else {
                                newSelectedTransactions.delete(transactionId);
                              }
                              setAutoCategorizeModal(prev => ({
                                ...prev,
                                selectedTransactions: newSelectedTransactions
                              }));
                            }}
                            style={styles.customCheckbox}
                          />
                        </td>
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
                            : `+${t.credit.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
              <div style={{ 
              marginTop: "20px", 
              fontSize: "14px", 
              color: "#6e6e73",
              textAlign: "center"
            }}>
              {autoCategorizeModal.selectedTransactions.size} of {autoCategorizeModal.filteredSimilarTransactions.length} filtered transactions selected
            </div><div style={{
                ...styles.closeButtonContainer,
                display: "flex",
                justifyContent: "space-between",
                gap: "12px"
              }}>
              <button
                onClick={closeAutoCategorizeModal}
                style={{ ...styles.modalButton, ...styles.cancelButton }}
              >
                Cancel
              </button>
              <button
                onClick={skipAutoCategorization}
                style={{ 
                  ...styles.modalButton, 
                  backgroundColor: "#ff9500",
                  color: "white"
                }}
              >
                Skip (Only Categorize Target)
              </button>
              <button
                onClick={applyAutoCategorization}
                style={{ ...styles.modalButton, ...styles.filterButton }}
                disabled={autoCategorizeModal.selectedTransactions.size === 0}
              >
                Apply to {autoCategorizeModal.selectedTransactions.size} Transaction{autoCategorizeModal.selectedTransactions.size !== 1 ? 's' : ''}
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
                    // Reset all additional items and categories to use default pastel colors
                    setAdditionalIncomes(prev => prev.map((income, index) => ({
                      ...income,
                      color: defaultPastelColors[index % defaultPastelColors.length]
                    })));
                    setIncomeCategories(prev => prev.map((category, index) => ({
                      ...category,
                      color: defaultPastelColors[(additionalIncomes.length + index) % defaultPastelColors.length]
                    })));
                    setAdditionalExpenses(prev => prev.map((expense, index) => ({
                      ...expense,
                      color: defaultPastelColors[(additionalIncomes.length + incomeCategories.length + index) % defaultPastelColors.length]
                    })));
                    setExpenseCategories(prev => prev.map((category, index) => ({
                      ...category,
                      color: defaultPastelColors[(additionalIncomes.length + incomeCategories.length + additionalExpenses.length + index) % defaultPastelColors.length]
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