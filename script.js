
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const filterInput = document.getElementById("filter");

const balanceDisplay = document.getElementById("balance");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const transactionList = document.getElementById("transaction-list");
const emptyMessage = document.getElementById("empty-message");

let transactions = [];

try {
  const savedTransactions = JSON.parse(
    localStorage.getItem("expenseTransactions") || "[]"
  );

  if (Array.isArray(savedTransactions)) {
    transactions = savedTransactions.filter((item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.description === "string" &&
      typeof item.amount === "number" &&
      Number.isFinite(item.amount) &&
      item.amount > 0 &&
      ["income", "expense"].includes(item.type) &&
      typeof item.category === "string"
    );
  }
} catch (error) {
  transactions = [];
}

function formatCurrency(amount) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR"
  });
}

function saveTransactions() {
  try {
    localStorage.setItem(
      "expenseTransactions",
      JSON.stringify(transactions)
    );
  } catch (error) {
    alert("Unable to save data in this browser.");
  }
}

function updateSummary() {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  balanceDisplay.textContent = formatCurrency(income - expense);
  incomeDisplay.textContent = formatCurrency(income);
  expenseDisplay.textContent = formatCurrency(expense);
}

function renderTransactions() {
  transactionList.replaceChildren();

  const selectedFilter = filterInput.value;

  const filteredTransactions = transactions.filter((item) =>
    selectedFilter === "all" || item.type === selectedFilter
  );

  emptyMessage.hidden = filteredTransactions.length > 0;

  filteredTransactions.forEach((item) => {
    const li = document.createElement("li");
    li.className = "transaction";

    const info = document.createElement("div");
    info.className = "transaction-info";

    const title = document.createElement("strong");
    title.textContent = item.description;

    const details = document.createElement("span");
    details.textContent = item.category + " • " + item.type;

    info.append(title, details);

    const actions = document.createElement("div");
    actions.className = "transaction-actions";

    const amount = document.createElement("span");
    amount.className =
      "transaction-amount " +
      (item.type === "income" ? "income-amount" : "expense-amount");

    amount.textContent =
      (item.type === "income" ? "+ " : "- ") +
      formatCurrency(item.amount);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      "Delete transaction: " + item.description
    );

    deleteButton.addEventListener("click", () => {
      transactions = transactions.filter(
        (transaction) => transaction.id !== item.id
      );

      saveTransactions();
      updateSummary();
      renderTransactions();
    });

    actions.append(amount, deleteButton);
    li.append(info, actions);
    transactionList.appendChild(li);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    alert("Please enter a description and a valid positive amount.");
    return;
  }

  const transaction = {
    id: crypto.randomUUID(),
    description,
    amount,
    type: typeInput.value,
    category: categoryInput.value
  };

  transactions.unshift(transaction);

  saveTransactions();
  updateSummary();
  renderTransactions();

  form.reset();
  typeInput.value = "expense";
  descriptionInput.focus();
});

filterInput.addEventListener("change", renderTransactions);

updateSummary();
renderTransactions();
