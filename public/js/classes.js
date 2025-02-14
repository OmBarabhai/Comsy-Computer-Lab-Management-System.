// User Class (Base Class)
class User {
    constructor(username, password, role) {
        this.username = username;
        this.password = password;
        this.role = role; // 'admin', 'student', 'staff'
    }

    login() {
        // Validate credentials
    }

    logout() {
        // Clear session
    }
}

// Computer Class
class Computer {
    constructor(id, name, status, specs) {
        this.id = id;
        this.name = name;
        this.status = status; // 'available', 'in-use', 'maintenance'
        this.specs = specs;
    }

    updateStatus(newStatus) {
        this.status = newStatus;
    }
}

// Booking Class
class Booking {
    constructor(user_id, computer_id, startTime, endTime) {
        this.user_id = user_id;
        this.computer_id = computer_id;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

// Admin Class
class Admin extends User {
    constructor(username, password) {
        super(username, password, 'admin');
    }

    // Admin-specific methods
    manageComputers() {
        console.log('Managing computers...');
    }
}

// Student Class
class Student extends User {
    constructor(username, password) {
        super(username, password, 'student');
    }

    // Student-specific methods
    bookComputer() {
        console.log('Booking computer...');
    }
}

// Staff Class
class Staff extends User {
    constructor(username, password) {
        super(username, password, 'staff');
    }

    // Staff-specific methods
    reportIssue() {
        console.log('Reporting issue...');
    }
}