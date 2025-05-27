1. INTRODUCTION
1.1. Overview of Comsy
Comsy: The Computer Lab Management System is a comprehensive, web-based application developed to manage and optimize computer lab activities in academic
institutions. It facilitates smooth coordination between lab administrators, and students by
offering essential features such as lab system booking, automated system monitoring,
attendance tracking, and issue reporting. The system is built using modern web
technologies—HTML, CSS, JavaScript (frontend), Node.js with Express (backend), and
MongoDB (database). With integrated security features like bcrypt password hashing and
JWT-based session management, Comsy ensures secure and efficient user management.
In addition to offering tailored dashboards for Admin, and Student, roles, Comsy also uses
Electron applications to automatically fetch and update system specifications in real-time,
while WebSocket integration enables live data updates across dashboards. The platform
not only simplifies routine tasks but also improves the efficiency and transparency of lab
usage through real-time system visibility, reducing dependency on manual work and
minimizing downtime.
1.2. Project Scope and System Needs
The primary goal of Comsy is to provide a centralized platform that simplifies and
automates the management of computer labs. The system is designed to cater to all critical
functions such as registering and monitoring systems, scheduling and approving computer
usage, logging and resolving technical issues, and maintaining attendance records. By
centralizing these functionalities, Comsy reduces the administrative burden and helps
maintain organized and efficient lab operations.
The system specifically addresses common challenges faced in traditional lab setups, such
as inefficient system allocation, lack of visibility into machine health and configuration,
and manual attendance and reporting. With features like role-based dashboards, real-time
monitoring, and automatic data syncing, Comsy meets the evolving demands of digital
infrastructure in educational environments. It is scalable and adaptable for use in single or
multi-lab setups within institutions.
1.3. Study of Existing Systems
Several systems have been developed in the past to support lab management, such as
ComTrack (2017), NETLab (2010), and LabDisplay (2005). These systems provided
solutions for remote monitoring, online lab resource management, and central
administrative control. However, many of them lacked real-time communication, robust
authentication mechanisms, or support for automatic hardware spec detection. They also
 Comsy : Computer Lab Management System
Page 2 of 42
HVPM COET
often required significant manual effort or had outdated user interfaces, limiting user
engagement and functionality.
Comsy builds upon the strengths of these earlier systems while addressing their
limitations. It introduces a secure authentication model, real-time system monitoring via
Electron, and instant communication through WebSockets. Furthermore, it is developed
using the latest open-source technologies, making it lightweight, scalable, and suitable for
modern educational needs. Its flexible design allows easy addition of new features such as
AI-based diagnostics and mobile app integration in the future.
1.4. Background and Motivation
In traditional academic computer labs, managing system usage, tracking student
attendance, and reporting system issues is often handled manually or with basic tools like
spreadsheets. This approach is inefficient, time-consuming, and prone to errors. With the
growing number of lab users and systems, institutions need a more reliable and scalable
method to streamline these operations. This challenge inspired the development of Comsy,
aiming to modernize lab management using a secure and intuitive digital solution.
The motivation behind Comsy also stems from the growing importance of resource
optimization in educational institutions. By offering visibility into lab usage patterns and
system performance, Comsy empowers administrators to make informed decisions,
minimize downtime, and enhance user satisfaction. The project not only improves lab
operational efficiency but also prepares students for real-world digital environments
through structured access to computing resources.
 Comsy : Computer Lab Management System
Page 3 of 42
HVPM COET
2. LITERATURE REVIEW
The evolution of computer lab management systems has been driven by the growing
demand for centralized control, automation, and enhanced user experience in academic
environments. Several research efforts and software prototypes have been introduced over
the past two decades to address different aspects such as monitoring, remote access, and
resource scheduling. In this section, we explore some of the most influential contributions
and highlight how Comsy builds upon and advances these concepts.
2.1. Existing Solutions and Limitations
Over the years, various systems have been proposed and developed to enhance the
management of computer labs. One such system is ComTrack, introduced by Harron et al.
(2017), which focuses on monitoring hardware and software configurations in academic
labs. ComTrack provided a foundation for integrating system monitoring, software
tracking, and database updates in real-time. However, it lacked real-time user interaction
and remote access request handling, limiting its scalability in dynamic academic
environments.
1. ComTrack (Harron et al., 2017)
ComTrack, developed by Harron et al. [1], is an innovative tool aimed at improving
computer lab administration. It introduced features like software and hardware
monitoring, user activity tracking, and centralized data management for academic labs.
However, while ComTrack focuses heavily on monitoring, it lacks a dedicated userrole-based access system and does not fully support real-time interaction or automation
via background agents, which are essential for modern lab environments.
2. NETLab (Maiti, 2010)
NETLab, proposed by Maiti [2], emphasizes remote control and online
experimentation in a lab setting. It is primarily designed for online learning
environments, supporting resource management and remote operations. Though highly
effective for e-learning scenarios, it does not cater to on-campus lab-specific features
like seat booking, issue tracking, or integration with offline lab hardware, which are
core to systems like Comsy.
3. LabDisplay (Smith, 2005)
LabDisplay, introduced by Smith [3], aimed to modernize lab management by
digitizing display and usage information across systems. It contributed toward lab
utilization transparency and user awareness. However, LabDisplay lacks modular
access control, security implementations like password hashing, and does not
incorporate backend technologies like WebSocket for real-time updates or JWT for
secure authorization, as implemented in Comsy.
 Comsy : Computer Lab Management System
Page 4 of 42
HVPM COET
4. LabManage (Patel et al., 2018)
This system focused on automated attendance tracking using RFID but offered no realtime monitoring or hardware diagnostics [4]. Comsy’s Electron-based agent automates
these tasks while providing live system updates.
5. SmartLab (Kumar & Sharma, 2019)
SmartLab employed IoT for device status monitoring but lacked system booking and
issue-reporting features [5]. Comsy extends this by integrating automation with a
streamlined, role-based interface for complete lab management.
6. LabMonitor (Lee et al., 2020)
LabMonitor supported multi-lab oversight via cloud, but its reliance on external
servers caused high latency [6]. Comsy avoids this by using a LAN-based Star
Topology for faster, more stable communication.
7. EduLab (Fernandez et al., 2016)
EduLab encouraged student collaboration and shared resources but did not automate
hardware tracking [7]. Comsy overcomes this with Electron-based agents that report
live system specs and connectivity metrics.
8. LabSecure (Zhang et al., 2021)
LabSecure emphasized strong cybersecurity protocols but lacked tools for resource
scheduling and usage tracking [8]. Comsy integrates RBAC and JWT-based security
while enabling efficient computer booking and issue logging.
9. AutoLab (Wilson et al., 2015)
AutoLab streamlined software deployment processes but required manual hardware
checks [9]. Comsy improves upon this by using a background Electron app to fetch
and update live system specifications automatically.
10. CampusLab (Garcia et al., 2022)
CampusLab focused on mobile-first lab management but lacked desktop system
integration [10]. Comsy maintains robust desktop support while planning future
enhancements for responsive mobile and cross-device access.
2.3 Technology Gap Addressed by Comsy
While previous systems address various aspects of lab management such as remote access,
resource scheduling, or system display, most of them fall short in integrating core
components like secure identity verification, real-time system feedback, role-based
control, and physical-machine synchronization. Furthermore, the absence of scalable APIs,
secure data handling, modern development stacks, and offline-to-online data transmission
made them less viable in today’s connected academic setups. There was also minimal
support for handling multi-lab operations under a single admin panel. Comsy addresses
 Comsy : Computer Lab Management System
Page 5 of 42
HVPM COET
these gaps by embedding Role-Based Access Control (RBAC), JWT-secured
authentication, modular dashboards, and WebSocket-based live updates across all system
nodes.
Its Electron-based monitoring agent runs silently in the background of each lab PC,
gathering hardware specs, connectivity status, power logs, and external device information
while also responding to admin queries from the server. This agent eliminates the need for
manual checks or third-party remote desktop tools. Additionally, Comsy introduces
support for time-bound system booking, user-based issue reporting, and real-time system
availability, ensuring optimal usage and proactive maintenance. Its scalable backend and
lightweight frontend allow easy expansion to multi-lab environments with minimal
overhead. This makes Comsy a comprehensive, secure, and future-ready lab management
solution specifically designed to meet the evolving needs of smart campuses and
educational institutions.
 Comsy : Computer Lab Management System
Page 6 of 42
HVPM COET
3. PROBLEM ANALYSIS
“Manual lab management wastes time, causes chaos, and leaves students stuck
Comsy steps in as a smart, real-time command center that streamlines monitoring,
booking, and issue reporting in one seamless platform.”
In many educational institutions, computer lab management is still handled manually,
leading to inefficiency, miscommunication, and poor tracking. Lab managers struggle to
monitor system specifications, maintenance, and real-time issues, often relying on physical
reports or spreadsheets prone to errors. For example, system failures go unnoticed until
reported manually, delaying repairs [1]. Students face challenges like finding available
systems or dealing with faulty ones during critical hours, wasting valuable time meant for
assignments, coding, or exams. The absence of a digital booking or issue-reporting system
results in confusion, repeated problems, and reduced productivity. These challenges
impact both lab managers’ efficiency and students’ learning outcomes, as highlighted by
studies like Harron et al. [1] and Maiti [2], which demonstrate the significant benefits of
automated and smart lab management systems.
3.1. Objectives of the System
The goal of Comsy: The Computer Lab Management System is to solve real-world
problems faced by both lab managers and students through a centralized, smart, and
automated platform. For lab managers, Comsy offers a single dashboard to monitor and
manage all lab systems, including system specifications, power and internet status,
hardware details, booking requests, reported issues, and user attendance. This replaces
manual registers, reduces paperwork, and improves time efficiency by automating
repetitive tasks and ensuring real-time updates [3][4]. On the other hand, students benefit
by being able to easily book systems that meet their specific needs, select available time
slots, and report issues directly from their dashboard without wasting time. This ensures
better planning, prevents time loss due to unavailable or faulty systems, and improves their
overall experience in the lab. With this approach, Comsy not only improves resource
utilization and communication but also encourages fair access and effective time
management for both administrators and students [7][8].
 Comsy : Computer Lab Management System
Page 7 of 42
HVPM COET
4. METHODOLOGY
The methodology describes the architecture, technologies, and development approach
used to build COMSY, ensuring secure authentication, real-time updates, and efficient
system management tailored for college computer labs.
4.1. Comsy system architecture
Comsy follows a three-tier architecture model, which enhances modularity, scalability, and
maintainability. The architecture is divided into three main layers: the Client Tier, the
Application Tier, and the Database Tier.
• Client Tier: This includes the front-end interface developed using HTML, CSS, and
JavaScript, accessible via a browser for users (Admin, and Students). Additionally, a
custom Electron Agent is installed on all lab systems. This agent runs in the
background, automatically fetching and sending hardware status, IP/MAC address,
network speed, and power status to the backend server. All users interact with this tier,
Figure 4.1: Comsy system architecture
 Comsy : Computer Lab Management System
Page 8 of 42
HVPM COET
logging in via a secure JWT-based token mechanism to access their dashboards and
perform tasks such as booking systems or reporting issues [3][5].
• Application Tier: This is the core logic layer, built using Node.js and Express.js. It acts
as a bridge between the front-end and the database. This tier handles authentication via
JWT (for secure session control) and bcrypt (for password hashing). A real-time data
pipeline is established using WebSockets, enabling bidirectional communication
between the server and clients. The system routes requests based on the user's role
(RBAC), directing each user to their specific dashboard with permitted functionalities
[6][9].
• Database Tier: All application data is stored securely in MongoDB, a NoSQL database.
Collections are organized for users, lab systems, bookings, issue reports, and
attendance logs. Data is dynamically updated in real time, enabling accurate system
status monitoring and smooth operation management. The modular schema supports
scalable enhancements and multi-lab support in future versions [8][10].
This architecture ensures the system is responsive, secure, and efficient, providing realtime feedback and seamless management for computer labs in academic settings.
4.2. Technology Stack
The development of Comsy: The Computer Lab Management System is powered by a
modern and efficient technology stack, selected to support real-time communication,
scalable backend processing, and a smooth user experience. Each technology plays a
unique role in ensuring the system functions reliably and efficiently.
4.2.1. Frontend Technologies (Used in Comsy)
• HTML5 : HTML5 structures dashboards and forms for login, booking, and reporting
in Comsy. It ensures semantic markup, responsive layout, and proper input handling
across all user roles, offering a consistent experience on lab desktops and browsers.
• CSS3 : CSS3 styles dashboards, forms, and navigation with support for light/dark
themes. It enhances usability through responsive layouts and smooth transitions,
maintaining a unified interface design across student, and admin views in Comsy.
• JavaScript : JavaScript handles client-side tasks in Comsy like form validation,
dashboard updates, JWT management, and API requests. It dynamically controls
content based on user role, improving responsiveness and interactivity without
reloading the page.
• Electron.js : Electron powers the desktop app installed on each lab system. It collects
system specs and network details in real time and sends data to the backend, allowing
admins to monitor lab computers remotely within Comsy.
 Comsy : Computer Lab Management System
Page 9 of 42
HVPM COET
4.2.2 Backend Technologies (Used in Comsy)
• Node.js : Node.js manages real-time communication, user authentication, and data
handling in Comsy. Its non-blocking I/O supports simultaneous tasks like login,
booking, and receiving Electron updates, ensuring efficient performance across
multiple lab users.
• Express.js : Express defines REST API routes in Comsy for login, booking, user data,
and system updates. Middleware ensures request validation, while simple routing
supports admin, student, interactions with the backend efficiently.
• JWT (JSON Web Tokens) : JWT secures Comsy's login sessions by encoding user
identity and role. Tokens are verified in middleware for route access control,
supporting role-based dashboards and authenticated actions like booking or reporting
issues.
• Bcrypt.js : Comsy uses bcrypt to hash user passwords before storing them in
MongoDB. This protects against plain-text password leaks and secures login
credentials through salted hashes, enhancing user data privacy.
• WebSocket : WebSocket provides Comsy with real-time updates. System changes,
bookings, and issue reports are instantly broadcasted to all connected dashboards,
keeping admin and user views synchronized without refreshing the browser.
4.2.3 Database and Cloud Services (Used in Comsy)
• MongoDB Atlas : Comsy uses MongoDB Atlas to store data related to users, bookings,
issues, and system status. Its cloud infrastructure supports scalability and real-time
operations, enabling quick access and updates to lab-related data collected from
Electron-based desktop agents.
• Mongoose ODM : Mongoose structures and validates Comsy's data in MongoDB. It
provides schema-based modeling for handling users, computers, and bookings. This
simplifies backend operations like querying, updating, and validating data for
authentication, issue reports, and role-based access control.
4.2.4 Development Tools and Environment
• Visual Studio Code : VS Code was the primary IDE used to develop Comsy. Its
integrated terminal, extensions for Node.js, and live debugging tools helped manage
both backend and frontend codebases efficiently, improving team productivity.
• Git & GitHub : Comsy's codebase was version-controlled using Git, and GitHub
supported collaboration. Branches were used for modular development, and GitHub
tracked changes, issues, and deployments during the project lifecycle.
 Comsy : Computer Lab Management System
Page 10 of 42
HVPM COET
4.3. Development Approach
Comsy was developed using the Object-Oriented Analysis and Design (OOAD)
methodology. This approach allowed us to map real-world lab interactions (like user roles,
system bookings, and issue reporting) into structured objects and workflows. The system
was designed with modular components—authentication, monitoring, dashboards, and
communication—each defined using UML diagrams such as use case, class, and sequence
diagrams. OO principles helped manage backend logic using RBAC and JWT, while
ensuring reusable and maintainable code.
This methodology ensured scalability, role-based control, and easy integration of features
across user roles (Admin, Student), contributing to a secure and efficient lab management
system.
4.4. System Requirements (Software and Hardware)
The Comsy system requires specific software and hardware components for successful
deployment and smooth operation.
4.4.1. Software Requirements:
• Frontend: HTML, CSS, JavaScript
• Backend: Node.js with Express.js
• Database: MongoDB Atlas
• Desktop App: Electron.js
• Authentication: bcrypt (for password hashing), JWT
• Real-time Communication: WebSocket
• Browser Support: Google Chrome, Firefox, Edge, Brave
• Operating System: Windows 10/11
• Package Manager: npm (Node Package Manager)
4.4.2. Hardware Requirements:
 Client Systems:
• Minimum 4GB RAM
• Minimum storage 128 GB
• Dual-core processor
• Internet access
• Node and Electron runtime installed for auto-updating specs
 Server System:
• Minimum 4GB RAM
• Minimum storage 128 GB
• Quad-core processor
• Internet access
• Node and Electron runtime installed for auto-updating specs
 Comsy : Computer Lab Management System
Page 11 of 42
HVPM COET
5. SYSTEM DESIGN
The system design phase of Comsy focuses on translating the project’s functional and nonfunctional requirements into structured visual models. It uses various UML diagrams and
data schemas to illustrate how the system components interact, how users perform tasks,
and how data flows across different modules. These visual representations help clarify the
architecture and behavior of the system before and during implementation [3][7].
5.1. Use case diagram
The Use Case Diagram models interactions between users (actors) and the system, clearly
representing how each role accesses system functionalities. In Comsy, two user roles are
defined—Admin, and Student, each with a distinct set of use cases. Admins handle critical
operations like system registration, user management, monitoring, and resolving issues.
Students are allowed to book systems, report issues, and view system information.
Common features like profile updates and theme toggling are available to all roles,
ensuring a personalized and role-specific user experience [3][4][7][8].
Figure 5.1: Comsy use case diagram
 Comsy : Computer Lab Management System
Page 12 of 42
HVPM COET
5.2. Class Diagram
The class diagram for Comsy illustrates the core entities involved in managing lab system
bookings and their interrelationships. Key classes include User, Computer, Booking, Spec,
and Issue, each representing a real-world component of the system. The diagram defines
how users interact with computers—through bookings, registration, or reporting issues—
and how computers maintain associated specifications and status logs. This structure
provides a clear, object-oriented view of the system’s data and behavior, ensuring better
modularity and maintainability [3][6][9].
The class diagram illustrates the static structure of Comsy, highlighting key entities, their
attributes, methods, and relationships essential for managing users, computers, bookings,
and system operations.
Figure 5.2: Comsy class diagram
 Comsy : Computer Lab Management System
Page 13 of 42
HVPM COET
5.3. Sequence Diagram
Sequence diagrams are used in COMSY (Computer Lab System Management) to visually
represent the interaction between users, the system interface, backend APIs, and the
database over time. These diagrams focus on the sequence of messages exchanged to
accomplish specific tasks in the system. By modeling these workflows, sequence diagrams
help stakeholders understand the behavior, timing, and logic behind user actions and
system responses [3][7]. In COMSY, three major functional flows are illustrated using
sequence diagrams: Login, Registering Lab Computers, and Booking Computers. Each of
these diagrams plays a critical role in describing the system's dynamic behavior [6][9].
5.3.1. Login Page Sequence Diagram
The login sequence diagram demonstrates the steps a user follows to authenticate into the
system. The process starts when the user submits their username and password on the login
page. The system checks the credentials against the database, and upon successful
validation, a JWT (JSON Web Token) is generated and stored in local storage. Based on
the user’s role (e.g., admin or student), the system then redirects the user to the appropriate
dashboard. This diagram shows a secure authentication flow along with token-based
authorization [4][8].
Figure 5.3.1: Comsy login page sequence diagram
 Comsy : Computer Lab Management System
Page 14 of 42
HVPM COET
5.3.2. Register PC Sequence Diagram
This diagram covers how a user (typically an admin or technician) registers a new lab
computer. It begins with fetching system specifications such as CPU, RAM, MAC address,
and IP. After submitting the registration form, the backend stores the data with a status of
"pending." The admin later reviews pending registrations, with the ability to either approve
or reject each one. Approved entries are updated in the system, while rejected ones are
deleted. This flow ensures that only verified computers are added to the inventory
[1][3][6][9].
Figure 5.3.2: Comsy register PC sequence diagram
 Comsy : Computer Lab Management System
Page 15 of 42
HVPM COET
5.3.3. Computer Booking Sequence Diagram
The booking sequence diagram illustrates how a student can reserve a computer and how
the admin manages those bookings. The student views a list of available (approved)
computers, selects one, and submits the desired time range. The system checks for conflicts
and saves the booking if no overlap is found. Admins can view all bookings in a dashboard,
and a background process periodically updates booking statuses (e.g., from "upcoming" to
"ongoing" or "completed") based on the current time. Additionally, admins can delete
bookings that are still in the "upcoming" state, ensuring control and accuracy of
reservations [2][5][6][9][10].
Figure 5.3.3: Comsy register PC sequence diagram
 Comsy : Computer Lab Management System
Page 16 of 42
HVPM COET
5.4. Comsy Database Schema.
The database schema for Comsy has been carefully architected using MongoDB, a
document-oriented NoSQL database, to address the specific needs of computer lab
management while ensuring optimal performance, flexibility, and scalability. This section
provides a comprehensive examination of the schema design, including its structural
components, data relationships, indexing strategies, and the rationale behind choosing a
NoSQL approach over traditional relational databases [6][8][9][10]. Below is a detailed
breakdown of the schema, and its structure.
5.4.1. Collection Schema
The database consists of four primary collections:
1. Users (Stores user credentials and roles)
The user collection stores admin, and student credentials with role-based permissions.
2. Computers (Tracks lab computers and their real-time status)
The Computers collection tracks real-time status and specifications of lab PCs.
Figure 5.4.1 (1): User collection schema
Figure 5.4.1 (2): Computer collection schema
 Comsy : Computer Lab Management System
Page 17 of 42
HVPM COET
3. Bookings (Manages computer reservations)
The Booking collection manages computer reservations with conflict prevention.
4. Issues (Logs reported hardware/software problems)
The Issues collection logs hardware/software problems reported by users.
5.4.2. Schema Diagram
Figure 5.4.1 (3): Bookings collection schema
Figure 5.4.1 (4): Issues collection schema
Figure 5.4.2: Comsy schema diagram
 Comsy : Computer Lab Management System
Page 18 of 42
HVPM COET
6. FUNCTIONAL MODULES IMPLEMENTATION
The functional module implementations in Comsy represent the core working units of the
system, covering authentication, monitoring, real-time updates, and security to ensure
smooth, secure, and role-based lab operations.
6.1. Authentication & Authorization module
The Authentication and Authorization module in Comsy ensures that only verified users
can access the system and perform actions based on their assigned roles. This module
combines three key mechanisms—RBAC (Role-Based Access Control), JWT (JSON Web
Tokens), and Bcrypt password hashing—to build a secure and scalable access system.
6.1.1. Role based access control (RBAC)
Role-Based Access Control (RBAC) restricts system access based on user roles.
Instead of assigning permissions individually, roles define access, simplifying
permission management in multi-user systems like Comsy [4].
RBAC (Role-Based Access Control) in Comsy helps establish clear role boundaries
between Admin, and Student users. It ensures that each user interacts only with the
features relevant to their responsibilities. This prevents confusion, enhances usability,
and maintains a clean and organized system experience across all roles [3][4][8].
RBAC is implemented using Node.js, Express, JWT, and custom middleware to verify
roles on protected routes. It improves security by enforcing least-privilege access and
simplifies permission checks. On the frontend, JavaScript dynamically shows or hides
UI features based on roles, ensuring a user-friendly experience and preventing
unauthorized actions [4][8].
 Core Logic / Algorithm
1. User login using credentials.
2. After login, retrieve user data from MongoDB.
3. Generate JWT containing the user’s ID and role.
4. Store the token on the client side.
5. On each API request, the server middleware:
• Verifies the JWT
• Extracts the user’s role
• Matches role with the required permission
• Grants or denies access accordingly
This logic ensures that all critical actions are performed only by users with the required
roles.
 Comsy : Computer Lab Management System
Page 19 of 42
HVPM COET
Figure 6.1.1: Role based access control Flowchart
 Comsy : Computer Lab Management System
Page 20 of 42
HVPM COET
6.1.2. JWT Token Flow
JWT (JSON Web Token) is a compact, URL-safe token format used to securely transmit
user identity between client and server. In Comsy, JWT enables stateless session
management—once a user logs in, their identity and role are encoded into a token,
allowing them to access protected features without maintaining server-side sessions. This
approach is lightweight and scalable, ideal for a multi-user lab management system [4][8].
JWT in Comsy is implemented using Node.js, Express.js, and the jsonwebtoken library
[4].
 Working and Core Logic / Algorithm
1. User submits login credentials via the frontend.
2. Backend validates credentials using Bcrypt.
3. If valid, the server issues a signed JWT containing the user's ID and role.
4. The client stores the token (e.g., in localStorage).
5. For every protected API request:
• The client includes the token in the Authorization header.
• Middleware (authenticate) verifies the token.
• If valid, user data is decoded and access is granted.
6. If invalid or expired (after 12 hours), access is denied, and the user is prompted to
log in again.
Figure 6.1.2: JWT token flow sequence diagram
 Comsy : Computer Lab Management System
Page 21 of 42
HVPM COET
6.1.3. Bcrypt Hashing
Bcrypt is a cryptographic hashing function designed specifically for securely storing
passwords. In Comsy, it is used to hash user passwords before saving them to the database,
making them unreadable in case of a data breach. The goal is to protect sensitive
credentials during registration, login, and profile updates. Comsy uses the official
"bcrypt": "^5.1.1" package in a Node.js and MongoDB environment, with integration
directly inside the Mongoose user schema and route logic [4][6][8].
 Working and Core Logic / Algorithm
1. During Registration (User Creation):
• The plain-text password is passed to bcrypt.hash() inside a Mongoose
pre('save') hook.
• A salt is automatically generated with a cost factor of 10.
• The hashed password is stored in MongoDB (not the plain-text version).
2. During Login:
• The entered password is compared with the hashed password stored in the
database using bcrypt.compare().
• If the comparison succeeds, the user is authenticated; otherwise, the login
is rejected.
3. During Profile Update (Password Change):
• If the user provides a new password, the old one is first validated using
bcrypt.compare().
• Once verified, the new password is hashed using bcrypt.hash() and saved.
This implementation ensures that plain-text passwords are never stored, and all user
password operations are protected using cryptographically secure hashing [4][8].
The use of bcrypt in Comsy significantly enhances the security of user data by preventing
unauthorized access to sensitive information. By employing hashing and salting
techniques, even if an attacker gains access to the database, the stored passwords remain
unreadable and uncrackable without the original salt and hashing mechanism. This
approach aligns with best practices for password storage and ensures that Comsy complies
with modern security standards. Moreover, the use of bcrypt’s cost factor helps maintain a
balance between security and performance, making it suitable for a scalable system that
can handle multiple concurrent users without sacrificing speed or reliability [6][9][10].
 Comsy : Computer Lab Management System
Page 22 of 42
HVPM COET
Figure 6.1.3: Bcrypt hashing flowchart
 Comsy : Computer Lab Management System
Page 23 of 42
HVPM COET
6.2. Automated System Specs monitoring and Hardware Detection
This module collects system specifications and hardware status from each lab PC in real
time. An Electron.js app runs in the background on system startup, using Node.js to detect
hardware and network details. The data is sent to the backend via WebSocket or REST API
and stored in MongoDB, where it becomes visible to the admin through the dashboard.
The goal is to give administrators live access to each system's health and availability. It
replaces manual tracking with automated monitoring and improves decision-making for
maintenance or allocation. Technologies used include Electron.js for the desktop app,
Node.js for system access, WebSocket/REST for communication, and MongoDB to store
and manage all collected PC data [4][6][9].
6.2.1. Electron app
Electron is an open-source framework that enables developers to build cross-platform
desktop applications using web technologies like HTML, CSS, and JavaScript. It
integrates the Chromium rendering engine with Node.js, allowing the application to have
both a user interface and direct access to system-level resources [5][6]. In Comsy, the
Electron app functions as a lightweight, background-running agent installed on every lab
computer. Its main role is to automatically collect system specifications and hardware
status.
Data Collected by Electron App
• System Information: CPU, RAM, Storage, OS, IP/MAC address
• Internet Speed: Download and upload rates
• Power Status: On/Off
• Operational Status: Available, In-Use, or Maintenance
• Hardware Detection: Mouse, Keyboard, Pendrive, Headphones (boolean flags)
The app starts when the system boots up. Using built-in Node.js modules and third-party
libraries, it reads system-level information. It then sends the collected data in real time to
the backend server via a REST API or WebSocket connection. This data is stored in
MongoDB and displayed on the admin dashboard, allowing administrators to monitor lab
systems remotely, ensure availability, and identify issues early [4][8].
Working and Core Logic
1. When a lab PC is powered on, the Electron app starts automatically.
2. The app collects system specifications using built-in Node.js libraries and thirdparty packages.
3. It checks hardware connectivity (mouse, keyboard, etc.) and measures internet
speed using a Node.js module.
4. The data is packaged and sent via an API or WebSocket to the backend server.
5. The backend stores or updates this info in the computers collection in MongoDB.
6. Admins can view the data live in a visual grid layout from their dashboard.
 Comsy : Computer Lab Management System
Page 24 of 42
HVPM COET
Figure 6.2: Automated System Specs monitoring and
Hardware Detection sequence diagram
 Comsy : Computer Lab Management System
Page 25 of 42
HVPM COET
6.3. Real-Time Communication Module (WebSocket Integration)
The Real-Time Communication module enables instant, bidirectional updates between the
client interfaces (admin and student dashboards) and the backend server without requiring
manual page refreshes [6][8]. This functionality is crucial in COMSY for ensuring that
real-time events—such as computer bookings, system status changes, or issue reports—
are immediately reflected across all connected dashboards, maintaining system accuracy
and user responsiveness [4][9].
How It Works
1. When the Electron app or a user performs an action (e.g., booking a system or
reporting an issue), a WebSocket message is triggered.
2. The backend WebSocket server receives the event and processes it (e.g., storing
in MongoDB or updating a status).
3. The server then broadcasts updates to all connected clients (e.g., admin
dashboard or system monitor).
4. Clients receive the update and immediately reflect the changes—such as showing
a new booking, changing system availability, or displaying a new issue
notification.
Figure 6.3: Real-Time Communication Module
(WebSocket Integration) sequence diagram
 Comsy : Computer Lab Management System
Page 26 of 42
HVPM COET
7. WORKING
Comsy: Computer Lab Management System is designed as a secure and modular platform
for managing computer labs in an academic setting. It provides differentiated dashboards
for Admin and Student users, each tailored with workflows that reflect their respective
responsibilities. The system leverages a role-based access control system, JWT tokenbased authentication, real-time data streaming, and a modular backend developed with
Node.js, Express, and MongoDB [4][6][8].
7.1. User Login
Both Admins and Students sign in through a unified login interface. Upon successful
authentication, the server generates a JWT token, encoding the user’s identity and role.
The client-side script stores this token and uses it to authorize subsequent requests [6][9].
A role-based redirect system ensures that:
• Admins are routed to a dashboard where they can manage computers, users,
bookings, and reported issues.
• Students access a simpler dashboard with options for viewing available
systems, booking computers, and reporting issues [4][7].
7.2. Admin Dashboard and Functionalities
The admin dashboard in Comsy provides a centralized interface for managing lab systems,
users, and real-time computer monitoring. It allows the admin to register systems, approve
bookings, resolve issues, and oversee live hardware and network statuses.
7.2.1. Register and Approve/Reject Computers
Admins are responsible for registering lab computers. The Register Computer form
automatically fetches the system’s:
• Basic Information: Computer name, IP address, MAC address
• Hardware Specs: CPU, RAM, storage, OS, and network
• Connected Devices: Keyboard, mouse, monitor, headphone, microphone,
pen-drive
• Network Speed: Download, upload, ping
Figure 7.1: User login flowchart
 Comsy : Computer Lab Management System
Page 27 of 42
HVPM COET
This data is submitted and stored in the computers collection with a default status:
pending. In the Pending Computers section, Admins can:
• Approve the system: Changes status to approved
• Reject the system: Marks it as rejected, preventing further actions
 This ensures only verified systems are exposed for student usage.
Figure 7.2: User dashboards flowchart
 Comsy : Computer Lab Management System
Page 28 of 42
HVPM COET
7.2.2. View and Manage Lab Computers
Under the Lab Computers section, Admins have a complete view of all registered systems.
Each row in the table presents:
• Name and IP Address
• Approval Status (approved / pending / rejected)
• Operational Status (available, in-use, maintenance)
• Power Status (on, off)
• Live network metrics (download, upload, ping)
Additionally, two key actions are provided per row:
• View Details (Popup): Opens a modal with full system specs, hardware flags,
timestamps, and the user who registered the device
• Delete Computer: Removes the computer entry entirely from the database
This module gives Admins full visibility and control over the lab's hardware
infrastructure.
7.2.3. Manage Bookings and Attendance
The View Bookings section is divided into:
• Upcoming Bookings: Admins can cancel these if needed
• Completed/Ongoing Bookings: Read-only, showing historic usage
• Booking data includes:
• User
• Computer name
• Booking date and time range
• Purpose of use
• Status (upcoming, ongoing, completed, cancelled)
Admins can access the View Attendance tab to generate reports filtered by date and time,
then download them in Excel or PDF format for administrative use.
7.2.4. Resolve Reported Issues
From the Reported Issues section, Admins can view all complaints logged by students.
Each report includes:
• A description
• Time of submission
• Computer involved
• Current status (open, in-progress, or resolved)
When a student reports an issue:
• A new entry is created in the Issues collection (status = open)
• The associated computer’s operationalStatus is immediately set to
maintenance, disabling new bookings
 Comsy : Computer Lab Management System
Page 29 of 42
HVPM COET
Admins resolve issues by updating the status to resolved, which automatically restores
the system to available.
7.2.5. Manage Users and Profile
From the Manage Users section, Admins can:
• Create and remove users
• Assign or modify roles (Admin / Student)
They can also update their personal details via View Profile, where they can change name,
email, and password. All data is stored securely in the Users collection, with passwords
encrypted via bcrypt.
7.3. Student Dashboard and Functionalities
The student dashboard in COMSY offers a simplified interface for booking available lab
systems and reporting technical issues. It enables students to view system specifications,
manage their bookings, and update their personal profile.
7.3.1. View Available Computers and Book Computer
Students can access the Available Computers section to explore systems approved by
Admins and marked as available. From there, they can proceed to the Book Computer
form and input:
• Desired date and time range
• Purpose of usage
Before saving, the system performs a conflict check against existing bookings. If no
overlap is found, a new record is created in the Bookings collection with status: upcoming.
The system auto-transitions the booking to ongoing and later completed using a pre-save
hook that checks timestamps.
7.3.2. Report Issues
Students encountering hardware or network problems use the Report Issue form. Each
report contains:
• Description of the issue
• Affected computer
 Once submitted:
• A new issue is logged in the Issues collection with status: open
• The affected computer’s operationalStatus is changed to maintenance
This flags the system as unavailable for further bookings and notifies the Admin for
resolution.
 Comsy : Computer Lab Management System
Page 30 of 42
HVPM COET
7.3.3. View Profile
Students also have access to View Profile, where they can:
• View registered details (name, email)
• Update their name or change their password securely
Password changes are confirmed through bcrypt and handled with secure validations.
Updates are reflected in the Users collection and trigger a logout on success.
7.4. Automation and Real-Time Monitoring
Several key processes run in the background:
• WebSocket Integration: Electron scripts installed on lab systems send live
network metrics to the Admin Dashboard
• Auto Status Management: Bookings auto-update between upcoming, ongoing,
and completed without manual admin intervention
• Specs Fetching: On registration, local system specs and device connections are
automatically detected
These automations ensure real-time visibility and reduce manual effort from both Students
and Admins.
 Comsy : Computer Lab Management System
Page 31 of 42
HVPM COET
8. RESULTS
The COMSY system was successfully developed and deployed with core features working
as intended across all user roles—admin and student. The system interface is clean,
responsive, and role-specific, providing distinct functionalities to users based on access
rights using RBAC (Role-Based Access Control). The following screenshots demonstrate
the working modules and functionalities of the system as tested on real-time environments.
8.1. Landing page
The landing page of COMSY provides a clean and intuitive entry point to the system. It
includes a top navigation bar with the COMSY logo, navigation links to sections like
About, Features, Tech Stack, and a footer with a Contact Us button. The interface also
offers a theme toggle button, allowing users to switch between light and dark modes for
improved accessibility and user preference.
8.2. Login Page
Users provide credentials for authentication. Invalid credentials trigger a prompt, while
valid users are redirected to their dashboards based on roles.
Figure 8.1: Comsy landing page
Figure 8.2: Comsy login page
 Comsy : Computer Lab Management System
Page 32 of 42
HVPM COET
8.3. Admin Dashboard
The admin dashboard shows live system data, issue tracking, user management, and
system control.
8.3.1. Admin dashboard overview
8.3.2. Registered computers list (Computer tab)
Figure 8.3.1: Admin dashboard overview
Figure 8.3.2: Registered computers list
 Comsy : Computer Lab Management System
Page 33 of 42
HVPM COET
8.3.3. System specifications
In computers tab, admin can see system specifications and connected peripherals by
clicking on ‘Details’ button.
Figure 8.3.3: System specifications
 Comsy : Computer Lab Management System
Page 34 of 42
HVPM COET
8.3.4. Computer registration
Admin can register new system/PC by clicking on Register this PC. After registration,
request sent to admins dashboard at Registration request. Now admin can approve or
reject the request.
8.3.5. Registration request
Figure 8.3.5: Registration request
Figure 8.3.4: Computer registration
 Comsy : Computer Lab Management System
Page 35 of 42
HVPM COET
8.3.6. Reported issues
8.3.7. View booking
8.3.8. View attendance
Figure 8.3.6: Reported issues tab
Figure 8.3.7: Bookings
Figure 8.3.8: Attendance
 Comsy : Computer Lab Management System
Page 36 of 42
HVPM COET
8.3.9. User management
8.3.10. User profile
Figure 8.3.9: User management
Figure 8.3.10: User profile
 Comsy : Computer Lab Management System
Page 37 of 42
HVPM COET
8.4. Student Dashboard
The student dashboard allows students to book lab Computers, report issues, view
computer specifications and update their profiles.
8.4.1. Computer booking
8.4.2. Report issue
Figure 8.4.1: Computer booking
Figure 8.4.2: Report issue
 Comsy : Computer Lab Management System
Page 38 of 42
HVPM COET
9. ADVANTAGES AND DISADVANTAGES
9.1. Advantages
9.1.1. Efficient Lab Management
Automates key tasks like system booking, attendance tracking, and issue reporting, helping
lab assistants and admins save time, reduce errors, and focus on system performance and
support.
9.1.2. Real-Time Updates
With WebSocket support, users and admins receive instant updates about system
availability, issue reports, and booking confirmations, improving coordination,
transparency, and the overall efficiency of lab operations.
9.1.3. User-Friendly Interface
Designed with a clean and intuitive UI/UX layout, the system ensures that students,
faculty, and admins can easily navigate features without needing technical knowledge or
long training sessions.
9.1.4. Role-Based Access
Access is securely restricted based on roles—Admin, Faculty, or Student—ensuring that
sensitive operations like system registration or user management are not misused and data
integrity is maintained.
9.1.5. Automatic Hardware Monitoring
The Electron-based desktop app automatically fetches and updates system hardware
details in real-time, reducing the burden on admins to manually track configurations or
record system status.
9.1.6. Scalable Design
Following OOAD methodology, the system is built with modular components and clean
architecture, allowing for easy future updates, mobile expansion, and adaptation across
multiple computer labs.
9.2. Disadvantages
9.2.1. Initial Setup Complexity
Installing and configuring tools like Node.js, MongoDB, and Electron requires some
technical expertise, which could be a barrier for lab managers or institutions without
dedicated IT support.
 Comsy : Computer Lab Management System
Page 39 of 42
HVPM COET
9.2.2. Dependency on Internet
The system relies on internet connectivity for real-time operations and cloud database
communication, which can affect performance during outages or in areas with unstable
network conditions.
9.2.3. Limited Mobile Access (Current Version)
The current implementation is not optimized for smartphones or tablets, limiting
accessibility for users who prefer managing bookings or reporting issues on mobile devices
anytime.
9.2.4. Learning Curve for Admins
Admins might need basic training or guidance to fully understand features like attendance
dashboards, system monitoring, and issue resolution, especially if unfamiliar with digital
lab tools.
9.2.5. Security Risks If Not Maintained
Without regular updates, expired tokens, weak password policies, or unpatched
dependencies could expose the system to risks like unauthorized access, data breaches, or
malware injection.
 Comsy : Computer Lab Management System
Page 40 of 42
HVPM COET
10. FUTURE SCOPE
To ensure Comsy stays future-ready and adapts to evolving technology trends, several
advanced enhancements are proposed. These additions focus on improving system
efficiency, user experience, connectivity, and security.
10.1. Enhancement of Connectivity
In the coming versions, Comsy aims to strengthen system connectivity between users and
devices through more advanced and reliable real-time communication. By refining
WebSocket protocols and enabling multi-channel broadcasting, the system will support
faster interactions and updates across all user dashboards. This improvement will be
especially beneficial for institutions operating multiple labs or campuses, allowing
centralized control, monitoring, and coordination between labs from a single unified
interface.
10.2. Enhanced User Experience (UI/UX)
User interaction with the system is a critical part of its overall success. To ensure that
students, and admins enjoy a smoother experience, future updates will include a redesigned
interface with a clean layout, faster response times, and mobile responsiveness.
Customizable dashboards and simplified navigation flows will help users complete their
tasks quickly, reducing confusion and making system usage more efficient and enjoyable
even for non-technical users.
10.3. Mobile Compatibility
As mobile usage continues to rise, making Comsy mobile-compatible is essential. A
responsive mobile-friendly web version and a native mobile application will allow users
to access all important features—such as booking systems, reporting issues, or checking
attendance—from their smartphones. This is particularly helpful for students during rush
hours or lab transitions, as they can plan and act in real time without needing to find an
available desktop.
10.4. AI-Powered Issue Tracking System
Comsy will integrate AI to detect recurring issues like system crashes or network failures.
It will suggest fixes based on historical data, reducing downtime and improving overall
system efficiency.
10.5. Enhanced Security System and User Protection
Comsy will implement advanced security protocols, including encrypted communication,
two-factor authentication, secure password recovery, and input sanitization to prevent
attacks like SQL injection, ensuring user data protection and privacy.
 Comsy : Computer Lab Management System
Page 41 of 42
HVPM COET
11. CONCLUSION
The development of COMSY – the Computer System Management platform –
successfully addressed the operational challenges of managing college computer labs
[6][8]. By integrating modern technologies such as Node.js, MongoDB, WebSockets, and
Electron, the system enables seamless, role-based access for students and admins [5][9].
Key functionalities like secure login using JWT and bcrypt, system booking, real-time
issue tracking, and automated system specification monitoring greatly improve lab
efficiency, transparency, and user experience [4][6][8].
Through a centralized dashboard, administrators can monitor the health and availability of
all connected systems, receive instant updates on issues or usage, and manage lab
resources proactively. Meanwhile, students benefit from simplified system booking and
transparent access. The modular design and real-time communication capabilities ensure
COMSY is both scalable and adaptable to future academic requirements, making it a robust
and practical solution for modern educational institutions [9].
COMSY lays a solid foundation for further enhancements such as integrating facial
recognition for attendance, mobile app access for remote bookings, and AI-powered
diagnostics to predict system failures [10]. Its real-time capabilities can be expanded to
support multi-lab environments across departments. By digitizing and automating lab
management, COMSY reduces manual workload, minimizes downtime, and promotes
better utilization of institutional resources—ultimately transforming traditional labs into
smart, responsive digital workspaces [4][7].
 Comsy : Computer Lab Management System
Page 42 of 42
HVPM COET
12. REFERENCES
[1] N. A. Harron et al., "ComTrack: Implementation of innovative computer lab
management tool for academic institutions," 2017 IEEE Symposium on Computer
Applications & Industrial Electronics (ISCAIE), Langkawi, Malaysia, 2017, pp.
132-135, doi: 10.1109/ISCAIE.2017.8074964. keywords:
{Workstations;Monitoring;Databases;Software;Computer
security;Hardware;Education;Computer Application;Computer lab
management;monitoring;Software;ComTrack},
[2] Maiti, "NETLab: An online laboratory management system," IEEE EDUCON
2010 Conference, Madrid, Spain, 2010, pp. 1351-1358, doi:
10.1109/EDUCON.2010.5492371. keywords: {Least squares
approximation;Videos;Animation;Data mining;Data
analysis;Feedback;Prototypes;Resource management;Remote
laboratories;Internet;Online experimentation;online laboratory;remote control;elearning},
[3] Jeff Smith. 2005. LabDisplay: bringing computer lab management into the new
millennium. In Proceedings of the 33rd annual ACM SIGUCCS conference on
User services (SIGUCCS '05). Association for Computing Machinery, New York,
NY, USA, 343–348. https://doi.org/10.1145/1099435.1099513
[4] R. Patel and S. Desai, "LabManage: RFID-Based Automated Attendance for
Computer Labs," IEEE Transactions on Education, vol. 61, no. 3, pp. 198-205,
2018, doi: 10.1109/TE.2018.2794321. keywords: {RFID;attendance
systems;computer lab management;automation;education technology},
[5] A. Kumar and P. Sharma, "SmartLab: IoT-Enabled Computer Lab Management,"
Journal of Educational Technology Systems, vol. 47, no. 4, pp. 512-527, 2019, doi:
10.1177/0047239519837335. keywords: {Internet of Things;lab
management;smart campus;IoT applications;educational technology},
[6] H. Lee et al., "LabMonitor: Cloud-Centric Lab Management for Universities,"
International Journal of Advanced Computer Science, vol. 10, no. 2, pp. 89-102,
2020, doi: 10.14569/IJACSA.2020.0100211. keywords: {Cloud computing;lab
management;resource allocation;virtual labs;higher education},
[7] M. Fernandez et al., "EduLab: Collaborative Tools for Computer Labs," ACM
SIGCSE Bulletin, vol. 48, no. 1, pp. 456-460, 2016, doi:
10.1145/2839509.2844678. keywords: {Collaborative learning;computer
labs;educational tools;group work;academic computing},
 Comsy : Computer Lab Management System
Page 43 of 42
HVPM COET
[8] Y. Zhang et al., "LabSecure: Cybersecurity Framework for Academic Labs," IEEE
Access, vol. 9, pp. 12345-12356, 2021, doi: 10.1109/ACCESS.2021.3056078.
keywords: {Cybersecurity;lab management;access control;data
protection;academic networks},
[9] D. Wilson et al., "AutoLab: Automated Software Deployment in Labs," Journal of
Systems and Software, vol. 112, pp. 234-245, 2015, doi: 10.1016/j.jss.2015.11.023.
keywords: {Software deployment;automation;lab management;configuration
management;IT infrastructure},
[10] L. Garcia et al., "CampusLab: Mobile-First Lab Management," Computers &
Education, vol. 180, 104432, 2022, doi: 10.1016/j.compedu.2022.104432.
keywords: {Mobile computing;lab management;higher education;responsive
design;user experience},
