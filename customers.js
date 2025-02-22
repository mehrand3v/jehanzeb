import { db } from './firebase.config.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    orderBy,
    where,
    Timestamp,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

class CustomerManager {
    constructor() {
        // Collection reference
        this.customersRef = collection(db, 'customers');
    }

    // Add new customer
    async addCustomer(customerData) {
        try {
            const customer = {
                ...customerData,
                totalBalance: 0,
                cylindersHeld: 0,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(this.customersRef, customer);
            console.log("Customer added with ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error adding customer:", error);
            throw error;
        }
    }

    // Get customer by ID
    async getCustomerById(customerId) {
        try {
            const customerDoc = await getDoc(doc(db, 'customers', customerId));
            if (customerDoc.exists()) {
                return { id: customerDoc.id, ...customerDoc.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting customer:", error);
            throw error;
        }
    }

    // Update customer
    async updateCustomer(customerId, updateData) {
        try {
            const customerRef = doc(db, 'customers', customerId);
            await updateDoc(customerRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });
            console.log("Customer updated successfully");
        } catch (error) {
            console.error("Error updating customer:", error);
            throw error;
        }
    }

    // Delete customer
    async deleteCustomer(customerId) {
        try {
            await deleteDoc(doc(db, 'customers', customerId));
            console.log("Customer deleted successfully");
        } catch (error) {
            console.error("Error deleting customer:", error);
            throw error;
        }
    }

    // Get all customers
    async getAllCustomers() {
        try {
            const q = query(this.customersRef, orderBy('updatedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting customers:", error);
            throw error;
        }
    }

    // Search customers by name or phone
    async searchCustomers(searchTerm) {
        try {
            // First search by name
            const nameQuery = query(
                this.customersRef,
                where('name', '>=', searchTerm),
                where('name', '<=', searchTerm + '\uf8ff')
            );

            // Then search by phone
            const phoneQuery = query(
                this.customersRef,
                where('phone', '>=', searchTerm),
                where('phone', '<=', searchTerm + '\uf8ff')
            );

            const [nameSnapshot, phoneSnapshot] = await Promise.all([
                getDocs(nameQuery),
                getDocs(phoneQuery)
            ]);

            // Combine and remove duplicates
            const results = new Map();

            nameSnapshot.docs.forEach(doc => {
                results.set(doc.id, { id: doc.id, ...doc.data() });
            });

            phoneSnapshot.docs.forEach(doc => {
                results.set(doc.id, { id: doc.id, ...doc.data() });
            });

            return Array.from(results.values());
        } catch (error) {
            console.error("Error searching customers:", error);
            throw error;
        }
    }

    // Get customers with outstanding balance
    async getCustomersWithBalance() {
        try {
            const q = query(
                this.customersRef,
                where('totalBalance', '>', 0),
                orderBy('totalBalance', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting customers with balance:", error);
            throw error;
        }
    }

    // Get customers with cylinders
    async getCustomersWithCylinders() {
        try {
            const q = query(
                this.customersRef,
                where('cylindersHeld', '>', 0),
                orderBy('cylindersHeld', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting customers with cylinders:", error);
            throw error;
        }
    }

    // Update customer cylinder count and balance
    async updateCustomerCylinderAndBalance(customerId, cylinderChange, balanceChange) {
        try {
            const customerRef = doc(db, 'customers', customerId);
            const customerDoc = await getDoc(customerRef);

            if (!customerDoc.exists()) {
                throw new Error('Customer not found');
            }

            const currentData = customerDoc.data();
            const newCylinderCount = currentData.cylindersHeld + cylinderChange;
            const newBalance = currentData.totalBalance + balanceChange;

            if (newCylinderCount < 0) {
                throw new Error('Cannot have negative cylinders');
            }

            await updateDoc(customerRef, {
                cylindersHeld: newCylinderCount,
                totalBalance: newBalance,
                updatedAt: Timestamp.now()
            });

            console.log("Customer cylinder count and balance updated successfully");
        } catch (error) {
            console.error("Error updating customer cylinder count and balance:", error);
            throw error;
        }
    }
}

// Export a single instance to be used across the application
export const customerManager = new CustomerManager();

// Example usage:
/*
// Add a new customer
const newCustomer = {
    name: "John Doe",
    phone: "1234567890",
    address: "123 Main St",
    email: "john@example.com"
};
const customerId = await customerManager.addCustomer(newCustomer);

// Update a customer
await customerManager.updateCustomer(customerId, {
    name: "John Smith"
});

// Get all customers
const allCustomers = await customerManager.getAllCustomers();

// Search customers
const searchResults = await customerManager.searchCustomers("John");

// Update cylinder count and balance
await customerManager.updateCustomerCylinderAndBalance(customerId, 1, 500); // Add 1 cylinder and 500 to balance
*/