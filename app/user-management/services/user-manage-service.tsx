// src/app/user-management/services/user-management-service.ts
export type User = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "HR" | "Viewer"; // Mendefinisikan nilai yang dapat diterima untuk role
  status: "Active" | "Inactive";
  department: string;
};

const DUMMY_USERS: User[] = [
  {
    id: "1",
    name: "James Clear",
    email: "james.clear@company.com",
    role: "HR",  // Sesuaikan dengan role yang valid
    status: "Active",
    department: "Human Resources",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Viewer",  // Sesuaikan dengan role yang valid
    status: "Active",
    department: "Finance",
  },
  {
    id: "3",
    name: "Nadia Putri Anggraini",
    email: "nadia.anggraini@company.com",
    role: "Super Admin",  // Sesuaikan dengan role yang valid
    status: "Active",
    department: "All Divisions",
  },
  {
    id: "4",
    name: "Rizky Aditya Ramadhan",
    email: "rizky.aditya@company.com",
    role: "HR",  // Sesuaikan dengan role yang valid
    status: "Inactive",
    department: "Recruitment",
  },
];

// Dummy API calls to simulate fetching data
export async function fetchUsers(): Promise<User[]> {
  // Simulasi delay dengan promise
  await new Promise((resolve) => setTimeout(resolve, 300));
  return DUMMY_USERS;
}

// Update a user
export async function updateUser(id: string, user: User): Promise<User> {
  // Mengupdate user pada data dummy
  const updatedUser = { ...user, id };
  const index = DUMMY_USERS.findIndex((u) => u.id === id);
  if (index > -1) {
    DUMMY_USERS[index] = updatedUser; // Update user
  }
  return updatedUser;
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  // Menghapus user dari data dummy
  const index = DUMMY_USERS.findIndex((u) => u.id === id);
  if (index > -1) {
    DUMMY_USERS.splice(index, 1); // Menghapus pengguna
  }
}

// Add a new user
export async function createUser(user: User): Promise<User> {
  // Menambahkan user baru ke data dummy
  const newUser = { ...user, id: (DUMMY_USERS.length + 1).toString() };
  DUMMY_USERS.push(newUser); // Menambahkan user ke array
  return newUser;
}
