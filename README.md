# 🏥 CareTracker – Medication Management System for Old-Age Homes

**Team EverRoot**

CareTracker is a web-based medication management system designed to help caregivers in old-age homes organize, monitor, and manage residents' daily medication schedules.

The application provides a digital platform for maintaining resident information, tracking medication status, and recording medication activities. Its goal is to make medication management more organized, accessible, and easier to monitor.

---

## 📌 Problem Statement

In old-age homes, many elderly residents depend on caregivers for their daily medications. Caregivers often manage multiple residents, medicines, dosages, and medication timings.

When these activities are handled manually, several challenges can occur:

- Difficulty managing multiple medication schedules.
- Forgetting or missing medication timings.
- Possibility of duplicate medication entries or doses.
- Difficulty tracking pending and missed medications.
- Time-consuming manual record maintenance.
- Lack of easily accessible medication history.

A digital medication management system can help organize these activities and make record monitoring easier.

---

## 💡 Our Solution – CareTracker

CareTracker provides a centralized digital interface where caregivers can view resident information, manage medication schedules, monitor medication statuses, and maintain digital activity records.

Instead of depending entirely on handwritten records, caregivers can use the application to access and update medication information through a simple interface.

---

## ✨ Key Features

### 1. Daily Medication Schedule
- View medications scheduled for the day.
- Organize medication information by resident.
- Monitor medication timings and pending tasks.

### 2. Medication Status Tracking
The application provides three medication statuses:

- **Pending:** Medication is waiting to be administered.
- **Administered:** Medication has been marked as given.
- **Missed:** Medication has been marked as missed.

### 3. Resident Directory
- View registered residents.
- Access resident-related information.
- Organize medication details according to residents.

### 4. Digital Audit Logs
- Maintain records of medication-related activities.
- View previous medication status updates.
- Make medication activity history easier to monitor.

### 5. Simple User Interface
- Easy-to-understand dashboard.
- Organized information display.
- Convenient navigation between application sections.

---

## ⚙️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and user interface design |
| JavaScript | Application functionality and interactions |
| Git | Version control |
| GitHub | Source code hosting and collaboration |
| Render | Application deployment and hosting |

---

## 🏗️ How the Application Works

CareTracker follows a web-based application architecture.

1. The user opens the application through a web browser.
2. The dashboard displays medication schedules and relevant information.
3. JavaScript handles user interactions through event listeners.
4. Application data is organized and processed using JavaScript objects and arrays.
5. Array filtering helps display relevant residents and medication records.
6. Medication status changes are reflected in the interface.
7. Browser local storage is used to retain demo application data.

### Single Page Application (SPA)

The application uses a Single Page Application approach, allowing users to navigate between different sections without repeatedly loading entirely new web pages.

---

## 🚀 Getting Started

Follow these steps to run CareTracker locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/dileep9611marathi/my-website.git
```

**2. Navigate to the project directory**

```bash
cd my-website
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### Production Build

To create a production build:

```bash
npm run build
```

The application is deployed using Render.

---

## 🌐 Live Demo

**Hosted Application:** https://my-website.onrender.com

*Note: Replace this URL if your actual Render service URL is different.*

---

## 🎯 Project Benefits

- Improves organization of daily medication schedules.
- Makes pending and missed medications easier to identify.
- Reduces dependence on manual record keeping.
- Saves caregivers time when accessing medication information.
- Makes medication activity records easier to monitor.
- Provides a foundation for future digital healthcare management solutions.

---

## 🔮 Future Scope

We plan to improve CareTracker by introducing the following features:

1. **Backend Database Integration:** Implement permanent and centralized data storage so multiple authorized users can access synchronized information.
2. **Medicine Inventory Management:** Track available medicines, quantities, and stock levels.
3. **SMS and WhatsApp Notifications:** Provide medication reminders and alerts to caregivers.
4. **User Authentication:** Introduce secure login and role-based access for administrators and caregivers.
5. **Advanced Reports:** Generate medication activity reports and historical summaries.

---

## 👥 Team Members – Team EverRoot

| Member | Responsibility |
|---|---|
| Chandan KG | Introduction and Problem Identification |
| Raghava R | Proposed Solution and Application Features |
| Dileep NM | Technologies and Technical Implementation |
| Poojith GV | Project Impact, Future Scope and Conclusion |

---

## 📚 Project Learning Outcomes

Through this project, we gained practical experience in:

- Developing a web-based application.
- Working with HTML, CSS, and JavaScript.
- Managing application data using JavaScript objects and arrays.
- Understanding event listeners and user interactions.
- Using Git and GitHub for version control.
- Deploying a web application using Render.
- Collaborating as a team to develop a real-world project.

---

## ⚠️ Important Note

CareTracker is an academic demonstration project. Its current implementation uses browser local storage, meaning data is stored separately in each browser rather than in a shared backend database.

It has not been validated for clinical use and should not be used as the sole system for real medication administration or medical record management.

A secure backend, proper access controls, data validation, audit safeguards, and clinical testing are required before real-world deployment.

---

## 🙏 Acknowledgement

We sincerely thank our faculty members and institution for their guidance and support throughout this project.

We also thank everyone who contributed ideas, feedback, and encouragement during the development of CareTracker.

**Team EverRoot – Building a more organized approach to medication management.**
