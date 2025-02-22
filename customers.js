// customers.js
import { db } from "./firebase.config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Get DOM elements
const addCustomerBtn = document.querySelector(".btn-secondary");
const modal = document.getElementById("addCustomerModal");
const closeBtn = modal.querySelector(".close-btn");
const cancelBtn = modal.querySelector(".cancel-btn");
const customerForm = document.getElementById("customerForm");
const customerSearch = document.getElementById("customerSearch");
const customerListContainer = document.getElementById("customerListContainer");
const loadingSpinner = document.createElement("div");
loadingSpinner.className = "loading-spinner";
loadingSpinner.textContent = "Loading...";
const nameInput = customerForm.querySelector('input[name="name"]');
const nameError = document.createElement("div");
nameError.className = "error-message";
nameInput.parentNode.appendChild(nameError);


// Name validation function
function validateName(name) {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return 'Name is required';
  }
  if (trimmedName.length < 2) {
    return 'Name must be at least 2 characters long';
  }
  if (trimmedName.length > 50) {
    return 'Name must be less than 50 characters';
  }
  if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
    return 'Name can only contain letters and spaces';
  }
  return '';
}

// Name input validation on input
nameInput.addEventListener('input', (e) => {
  const error = validateName(e.target.value);
  nameError.textContent = error;
  nameInput.classList.toggle('invalid', error !== '');
});

// Show modal when "Add Customer" is clicked
function showModal() {
modal.style.display = "block";
    customerForm.reset(); // Clear form when opening
    nameError.textContent = "";
}

function hideModal() {
  modal.style.display = "none";
  nameError.textContent = ""; // Clear error messages when closing
}
addCustomerBtn.addEventListener("click", showModal);
// Close modal handlers
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
cancelBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) hideModal();
});
// Form submission
customerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate name before submission
  const nameError = validateName(customerForm.name.value);
  if (nameError) {
    showNotification(nameError, "error");
    return;
  }

  const submitBtn = customerForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Adding...";

  const formData = {
    name: customerForm.name.value.trim(),
    phone: customerForm.phone.value.trim(),
    address: customerForm.address.value.trim(),
    totalBalance: 0,
    cylindersHeld: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const customersRef = collection(db, "customers");
    await addDoc(customersRef, formData);
    hideModal();
    customerForm.reset();
    showNotification("Customer added successfully!", "success");
  } catch (error) {
    console.error("Error saving customer:", error);
    showNotification("Failed to add customer. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Add Customer";
  }
});

// Real-time customers listener
function setupCustomersListener() {
  const customersRef = collection(db, "customers");
  const q = query(customersRef, orderBy("updatedAt", "desc"));

  customerListContainer.appendChild(loadingSpinner);

  onSnapshot(
    q,
    (snapshot) => {
      const customers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      renderCustomers(customers);
      loadingSpinner.remove();
    },
    (error) => {
      console.error("Error in customers listener:", error);
      loadingSpinner.remove();
      showNotification(
        "Error loading customers. Please refresh the page.",
        "error"
      );
    }
  );
}

// Render customers in the list
function renderCustomers(customers) {
  if (customers.length === 0) {
    customerListContainer.innerHTML = `
      <div class="empty-state">
        <p>No customers found</p>
      </div>
    `;
    return;
  }

  customerListContainer.innerHTML = customers
    .map(
      (customer) => `
        <div class="customer-card" data-customer-id="${customer.id}">
            <div class="customer-info">
                <h3>${escapeHtml(customer.name)}</h3>
                <p>${escapeHtml(customer.phone)}</p>
                <p>${escapeHtml(customer.address)}</p>
                <p>Cylinders: ${customer.cylindersHeld}</p>
            </div>
            <div class="customer-balance">₹${customer.totalBalance.toFixed(2)}</div>
        </div>
    `
    )
    .join("");
}


// Search functionality with debouncing
let searchTimeout;

customerSearch.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  const searchTerm = e.target.value.toLowerCase();

  searchTimeout = setTimeout(async () => {
    const customersRef = collection(db, "customers");
    try {
      const snapshot = await getDocs(customersRef);
      const customers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredCustomers = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.phone.includes(searchTerm)
      );

      renderCustomers(filteredCustomers);
    } catch (error) {
      console.error("Error searching customers:", error);
      showNotification("Error searching customers", "error");
    }
  }, 300); // Debounce for 300ms
});

// Utility functions
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Handle bottom nav customer tab click
document.querySelector('.nav-item[href="#"]').addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".customer-list").style.display = "block";
});

// Initialize customers list
document.addEventListener("DOMContentLoaded", setupCustomersListener);
