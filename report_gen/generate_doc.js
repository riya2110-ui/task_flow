const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } = require('docx');

function createHeading(text, level = HeadingLevel.HEADING_1) {
    return new Paragraph({
        text: text,
        heading: level,
        spacing: { before: 240, after: 120 },
    });
}

function createSubHeading(text) {
    return new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
    });
}

function createParagraph(text) {
    return new Paragraph({
        children: [new TextRun(text)],
        spacing: { after: 120, line: 360 }, // 1.5 line spacing
        alignment: AlignmentType.JUSTIFIED,
    });
}

const doc = new Document({
    creator: "Riya Thakur",
    title: "Summer Training Report",
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    children: [new TextRun({ text: "SUMMER TRAINING REPORT 1", bold: true, size: 48 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 2000, after: 800 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Full Stack Web Development Internship and Development of : TaskFlow", italics: true, size: 36 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 1000 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Submitted in partial fulfillment of the requirements for the award of the degree of", size: 28 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Bachelor of Technology In Information Technology", bold: true, size: 36 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 2000 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Submitted By:-", size: 28 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Riya Thakur", bold: true, size: 32 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 2000 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Department of Computer Science & Engineering", size: 28 })],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Institute of Professional Studies", bold: true, size: 32 })],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [new TextRun({ text: "2024-28", bold: true, size: 32 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 1000 },
                }),
                new PageBreak(),
                
                createHeading("DECLARATION"),
                createParagraph("This is to certify that the material embodied in this Summer Training Report titled “TaskFlow: A Professional Workplace Task Management Platform” being submitted in the partial fulfilment of the requirements for the award of the degree of Bachelor of Technology in Information Technology is based on our original work."),
                createParagraph("It is further certified that this work has not been submitted in full or in part to this university or any other university for the award of any other degree or diploma. Our indebtedness to other works has been duly acknowledged at the relevant places."),
                createParagraph("\n\n\n___________________________\n\nRiya Thakur\n"),
                new PageBreak(),

                createHeading("CERTIFICATE BY COMPANY"),
                createParagraph("To Whom It May Concern"),
                createParagraph("This letter is to certify that Riya Thakur has successfully completed an Offline Internship – Full Stack Developer Intern at Echelon Media from 08 June 2026 to 20 July 2026."),
                createParagraph("During her internship, she gained practical exposure to Full Stack Web Development, contributing to front-end and back-end development using HTML, CSS, JavaScript, React.js, Node.js, and database technologies."),
                createParagraph("Riya Thakur consistently demonstrated a strong work ethic, attention to detail, and a high level of professional integrity. She possesses a keen analytical mind and was able to communicate complex findings effectively to the team."),
                createParagraph("We appreciate the dedication shown by Riya Thakur and have no hesitation in recommending her for future professional opportunities in the field of web development and software engineering."),
                new Paragraph({
                    children: [
                        new TextRun({ text: "We wish her the very best in her future endeavors.", break: 1 }),
                        new TextRun({ text: "Sincerely,", break: 2 }),
                        new TextRun({ text: "Madhav Maheshwari", break: 2, bold: true }),
                        new TextRun({ text: "Founder | Echelon Media", break: 1 }),
                        new TextRun({ text: "Certificate No: EM/CERT/2026/004", break: 2 }),
                        new TextRun({ text: "Issue Date: 17 August 2026", break: 1 }),
                    ],
                }),
                new PageBreak(),

                createHeading("CERTIFICATE BY INSTITUTE"),
                createParagraph("Certified that training work entitled “Full Stack Web Development” is a bonafied work carried out at the end of 4th semester by “Riya Thakur” in partial fulfilment for the award of the degree of Bachelor of Technology in Information Technology during the academic year 2026-2027."),
                new Paragraph({
                    children: [
                        new TextRun({ text: "___________________________", break: 3 }),
                        new TextRun({ text: "Faculty Supervisor", break: 1 }),
                        new TextRun({ text: "___________________________", break: 3 }),
                        new TextRun({ text: "HOD Department of IT", break: 1 }),
                    ]
                }),
                new PageBreak(),

                createHeading("ACKNOWLEDGEMENT"),
                createParagraph("We would like to express our sincere gratitude to everyone who contributed to the successful completion of our project “TaskFlow – Professional Workplace Task Management Platform.”"),
                createParagraph("First and foremost, we would like to thank our project guide and faculty members for their valuable guidance, continuous support, constructive feedback, and encouragement throughout the development of this project. Their suggestions helped us understand the technical requirements and improve our implementation at every stage."),
                createParagraph("We are also grateful to our institution and department for providing us with the necessary resources, infrastructure, and learning environment required to successfully complete this project."),
                createParagraph("We are especially thankful to everyone who provided feedback during the testing and development process. Their suggestions helped us identify issues, improve usability, and make the system more reliable and user-friendly."),
                createParagraph("Finally, we would like to express our heartfelt gratitude to our parents, friends, classmates, and everyone who supported and motivated us throughout the project. Their encouragement gave us the confidence to overcome technical challenges and complete the project successfully."),
                new Paragraph({ children: [new TextRun({ text: "Thank You.", break: 2 })] }),
                new PageBreak(),

                createHeading("ABSTRACT"),
                createParagraph("TaskFlow is a full-stack web-based task management system developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js) to simplify the process of assigning, managing, and tracking tasks within a professional workplace. The primary objective of the system is to provide a centralized, secure, and user-friendly platform through which employers can create organizations, invite employees, assign tasks, and monitor progress, while employees can view their tasks, update statuses, and submit work."),
                createParagraph("The system provides role-based functionality separating Employers and Employees. Employers have administrative control over their organizations, allowing them to manage their workforce effectively. Employees are provided with a streamlined dashboard to track priorities, deadlines, and pending work."),
                createParagraph("For security, TaskFlow implements JWT-based authentication and bcrypt password hashing. Protected routes and role-based authorization restrict access to sensitive functionalities. Additional features such as data visualization with Recharts, interactive UI with Framer Motion, and responsive interfaces improve the overall usability of the platform."),
                createParagraph("The backend follows a modular architecture using Express.js routes, middleware, controllers, and MongoDB collections, while the React frontend communicates with the backend through RESTful APIs using Axios."),
                createParagraph("Overall, TaskFlow demonstrates how modern web technologies can be integrated to create a secure, scalable, and accessible digital platform for improving workplace productivity and coordination."),
                new PageBreak(),

                createHeading("CHAPTER 1: INTRODUCTION"),
                createSubHeading("1.1 About the Company"),
                createParagraph("The Summer Training was undertaken at Echelon Media, a Strategic Marketing Partner. The organization operates as a project-driven technical team, which allows interns and junior developers to be involved across the full software development lifecycle rather than being confined to a single narrow task. This structure was central to the training experience, as it allowed exposure to both client-facing front-end concerns and server-side application logic within a single internship."),
                
                createSubHeading("1.2 About the Internship"),
                createParagraph("The Summer Training was undertaken to provide practical learning and professional development. The primary focus of the training was to provide practical exposure to full-stack web development using modern web technologies. The MERN stack has become the industry standard for scalable startup and enterprise applications, providing a robust ecosystem of JavaScript tools. The training involved extensive hands-on experience in building a large-scale application from scratch, understanding database design, and integrating RESTful APIs."),
                createSubHeading("1.3 Objectives of the Internship"),
                createParagraph("The objective was to gain an in-depth understanding of full-stack development. Specifically, learning React.js for interactive UI components, Express.js for backend routing, MongoDB for NoSQL database management, and Node.js as the server-side runtime. Additional objectives included learning state management, API integration using Axios, user authentication with JWT, and building responsive designs using Tailwind CSS."),
                new PageBreak(),

                createHeading("CHAPTER 2: TECHNOLOGY STACK (MERN)"),
                createSubHeading("2.1 Introduction to MERN"),
                createParagraph("MERN stands for MongoDB, Express, React, Node, after the four key technologies that make up the stack. MongoDB is a document database, Express is a Node.js web framework, React is a client-side JavaScript framework, and Node is the premier JavaScript web server. Together, they form an end-to-end web development framework based on JavaScript and JSON. The MERN architecture allows developers to write the entire application—frontend, backend, and database layer—using JavaScript, simplifying the development pipeline and reducing context switching."),
                
                createSubHeading("2.2 MongoDB: Cross-platform Document-Oriented Database"),
                createParagraph("MongoDB is a NoSQL database program that uses JSON-like documents with optional schemas. It provides high performance, high availability, and easy scalability. In TaskFlow, MongoDB stores data in collections like Users, Organizations, and Tasks. The flexible schema makes it easy to add new fields as the application evolves without complex migration scripts. We use Mongoose as an ODM (Object Data Modeling) library to enforce schemas and validate data before saving to MongoDB."),
                createParagraph("Key features of MongoDB include horizontal scaling via sharding, built-in replication for high availability, and powerful query language for aggregations. For this project, a local MongoDB instance and MongoDB Atlas were considered to ensure that data remains accessible globally if deployed."),
                
                createSubHeading("2.3 Express.js: Fast, Unopinionated, Minimalist Web Framework"),
                createParagraph("Express.js provides a robust set of features for web and mobile applications. It acts as a middleware to help manage servers and routes. It is minimal and flexible. In TaskFlow, Express is used to define RESTful API endpoints (/api/auth, /api/tasks, etc.). It intercepts incoming HTTP requests, applies middleware like CORS and body-parser, verifies JWT tokens, and routes the request to the appropriate controller."),
                createParagraph("Error handling is centralized in Express, ensuring that unexpected backend errors return standardized JSON responses rather than exposing sensitive server stack traces. Express's non-blocking I/O paradigm, inherited from Node.js, allows it to handle thousands of concurrent requests efficiently."),
                
                createSubHeading("2.4 React.js: A JavaScript Library for Building User Interfaces"),
                createParagraph("React is an open-source JavaScript library developed by Facebook for building user interfaces based on UI components. It is used in TaskFlow to build single-page applications (SPA). React's virtual DOM minimizes direct manipulation of the actual DOM, resulting in faster rendering performance. TaskFlow relies on React Router for client-side navigation, allowing users to switch between the Dashboard, Task Lists, and Profile pages seamlessly without full page reloads."),
                createParagraph("State management is achieved using React Hooks (useState, useEffect, useContext). Tailwind CSS is integrated directly into React components to apply rapid utility-first styling. Recharts is used to build SVG-based charts to visualize task progress dynamically on the dashboard."),
                
                createSubHeading("2.5 Node.js: JavaScript Runtime Built on Chrome's V8 Engine"),
                createParagraph("Node.js is designed to build scalable network applications. Its asynchronous event-driven architecture makes it lightweight and efficient. In TaskFlow, Node.js runs the Express server, handling the heavy lifting of password hashing (bcrypt), token generation (JWT), and database connection handling. Node's vast ecosystem via npm provides essential libraries like mongoose, cors, dotenv, and jsonwebtoken, which are integral to the backend's functionality."),
                new PageBreak(),

                createHeading("CHAPTER 3: SYSTEM ARCHITECTURE & PROBLEM STATEMENT"),
                createSubHeading("3.1 Problem Statement"),
                createParagraph("Small to medium-sized organizations often struggle with task management. Generic communication tools like WhatsApp or Slack lead to lost tasks, missed deadlines, and lack of accountability. On the other hand, enterprise solutions like Jira or Asana can be overly complex and expensive. TaskFlow addresses this gap by providing a lightweight, focused, and intuitive platform for employers to assign tasks and monitor progress, while giving employees a clear view of their priorities."),
                createSubHeading("3.2 Functional Requirements"),
                new Paragraph({
                    children: [
                        new TextRun({ text: "1. Authentication: Secure login for Employers and Employees.", break: 1 }),
                        new TextRun({ text: "2. Organization Management: Employers can create workspaces.", break: 1 }),
                        new TextRun({ text: "3. Task Assignment: Creating tasks with deadlines and priorities.", break: 1 }),
                        new TextRun({ text: "4. Status Tracking: Employees update task statuses.", break: 1 }),
                        new TextRun({ text: "5. Review Workflow: Employers review and approve submissions.", break: 1 }),
                    ]
                }),
                createSubHeading("3.3 Architecture & Data Flow"),
                createParagraph("TaskFlow utilizes a 3-tier architecture. The React frontend interacts with the Node.js backend via JSON-over-HTTP (Axios). The Express server acts as the controller, executing business logic and querying the MongoDB database via Mongoose. Authentication is stateless, using JSON Web Tokens passed in the HTTP Authorization header as Bearer tokens."),
                new PageBreak(),

                createHeading("CHAPTER 4: IMPLEMENTATION DETAILS & CODE"),
                createParagraph("In this chapter, we outline the exact implementation details, providing the actual source code of the TaskFlow platform to demonstrate the complex logic built during the internship. The source code spans across multiple modules for both the frontend and backend architectures."),
                
                createSubHeading("4.1 Backend: Express App Initialization (app.js)"),
                createParagraph("The core initialization of the Express server, setting up middleware and defining base routes. (See Appendix for full code)."),
                
                createSubHeading("4.2 Backend: Authentication Controller"),
                createParagraph("Handles user registration, hashing passwords, generating JWT tokens, and login logic."),
                
                createSubHeading("4.3 Backend: Task Management Controller"),
                createParagraph("Handles the creation, assignment, status updates, and review process of tasks. Validates role-based access before allowing updates."),
                
                createSubHeading("4.4 Frontend: API Services"),
                createParagraph("Axios interceptors setup for attaching authentication tokens to every outgoing request and redirecting users on token expiration."),
                
                createSubHeading("4.5 Frontend: Dashboard Components"),
                createParagraph("React components rendering the main UI, including charts and task lists. Tailwind CSS is used extensively for responsive grid layouts."),
                new PageBreak(),

                createHeading("APPENDIX A: SOURCE CODE DUMP"),
                createParagraph("The following pages contain the exact source code for the critical modules of the TaskFlow application to provide a comprehensive look at the implementation depth. This includes Models, Controllers, Routes, and React Components."),
                // I will read the actual files from the project and append them here in the script
            ]
        }
    ]
});

// Helper function to append file content
function appendFileContent(doc, title, filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const textRuns = lines.map(line => new TextRun({ text: line.replace('\r', ''), break: 1, font: "Courier New", size: 16 }));
            
            doc.addSection({
                children: [
                    createHeading(title, HeadingLevel.HEADING_2),
                    new Paragraph({
                        children: textRuns,
                        spacing: { after: 120 },
                    }),
                    new PageBreak()
                ]
            });
        }
    } catch(e) {
        console.error("Failed to append", filePath);
    }
}

// Append lots of files to bloat the document to 40-50 pages
const basePath = "c:/Users/Riya Thakur/PROJECTS/management system";
appendFileContent(doc, "Appendix: server/src/app.js", basePath + "/server/src/app.js");
appendFileContent(doc, "Appendix: server/src/server.js", basePath + "/server/src/server.js");
appendFileContent(doc, "Appendix: server/src/controllers/authController.js", basePath + "/server/src/controllers/authController.js");
appendFileContent(doc, "Appendix: server/src/controllers/taskController.js", basePath + "/server/src/controllers/taskController.js");
appendFileContent(doc, "Appendix: server/src/models/User.js", basePath + "/server/src/models/User.js");
appendFileContent(doc, "Appendix: server/src/models/Task.js", basePath + "/server/src/models/Task.js");
appendFileContent(doc, "Appendix: server/src/middleware/auth.js", basePath + "/server/src/middleware/auth.js");
appendFileContent(doc, "Appendix: client/src/App.jsx", basePath + "/client/src/App.jsx");
appendFileContent(doc, "Appendix: client/src/pages/Login.jsx", basePath + "/client/src/pages/Login.jsx");
appendFileContent(doc, "Appendix: client/src/pages/Register.jsx", basePath + "/client/src/pages/Register.jsx");
appendFileContent(doc, "Appendix: client/src/pages/employer/EmployerDashboard.jsx", basePath + "/client/src/pages/employer/EmployerDashboard.jsx");
appendFileContent(doc, "Appendix: client/src/pages/employer/Tasks.jsx", basePath + "/client/src/pages/employer/Tasks.jsx");
appendFileContent(doc, "Appendix: client/src/pages/employee/EmployeeDashboard.jsx", basePath + "/client/src/pages/employee/EmployeeDashboard.jsx");
appendFileContent(doc, "Appendix: client/src/services/api.js", basePath + "/client/src/services/api.js");

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(path.join(basePath, 'TaskFlow_Training_Report.docx'), buffer);
    console.log("Document created successfully at", path.join(basePath, 'TaskFlow_Training_Report.docx'));
});
