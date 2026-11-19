
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  History,
  UserRound,
  LogOut,
  CheckCircle2,
  Clock3,
  Activity,
  Upload,
  FileText,
  X,
  Menu,
  Camera,
  CalendarDays,
  Bell,
  CheckCheck,
  Layers,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import "./styles.css";

const initialTasks = [
  {
    id: 1,
    title: "Fire and Smoke Detection",
    project: "AI Monitoring System",
    status: "IN_PROGRESS",
    deadline: "2026-11-25"
  },
  {
    id: 2,
    title: "Dataset Collection",
    project: "AI Monitoring System",
    status: "ASSIGNED",
    deadline: "2026-11-28"
  },
  {
    id: 3,
    title: "Model Testing",
    project: "AI Monitoring System",
    status: "COMPLETED",
    deadline: "2026-11-15"
  }
];

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [tasks, setTasks] = useState(() =>
    readStorage("svce_demo_tasks", initialTasks)
  );

  const [history, setHistory] = useState(() =>
    readStorage("svce_submission_history", [])
  );

  const [user, setUser] = useState(() =>
    readStorage("svce_demo_profile", {
      name: "Team Member",
      email: "member@svce.edu.in",
      usn: "",
      department: "Computer Science",
      avatar: ""
    })
  );

  const [notifications, setNotifications] = useState(() =>
    readStorage("svce_demo_notifications", [
      {
        id: 1,
        title: "Welcome to SVCE ERP",
        message: "Welcome to your Team Member Dashboard.",
        time: "Just now",
        read: false
      },
      {
        id: 2,
        title: "New Task Assigned",
        message: "You have tasks waiting for your attention.",
        time: "Today",
        read: false
      }
    ])
  );

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileUSN, setProfileUSN] = useState(user.usn || "");

  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    localStorage.setItem("svce_demo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      "svce_submission_history",
      JSON.stringify(history)
    );
  }, [history]);

  useEffect(() => {
    localStorage.setItem("svce_demo_profile", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(
      "svce_demo_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  const completed = tasks.filter(
    task => task.status === "COMPLETED"
  ).length;

  const pending = tasks.filter(
    task => task.status === "ASSIGNED"
  ).length;

  const inProgress = tasks.filter(
    task => task.status === "IN_PROGRESS"
  ).length;

  const unreadCount = notifications.filter(
    item => !item.read
  ).length;

  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const addNotification = (title, message) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        title,
        message,
        time: new Date().toLocaleString(),
        read: false
      },
      ...prev
    ]);
  };

  const markAllRead = () => {
    setNotifications(prev =>
      prev.map(item => ({ ...item, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    setSelectedNotification(null);
  };

  const openNotification = id => {
    const notification = notifications.find(
      item => item.id === id
    );

    if (!notification) return;

    setNotifications(prev =>
      prev.map(item =>
        item.id === id ? { ...item, read: true } : item
      )
    );

    setSelectedNotification({
      ...notification,
      read: true
    });

    setActivePage("notifications");
  };

  const goToPage = page => {
    setActivePage(page);
    setSelectedTask(null);

    if (page === "notifications") {
      setSelectedNotification(null);
    }
  };

  const openSubmissionPage = task => {
    setSelectedTask(task);
    setSelectedFile(null);
    setDescription("");
  };

  const closeSubmissionPage = () => {
    setSelectedTask(null);
    setSelectedFile(null);
    setDescription("");
  };

  const submitTask = e => {
    e.preventDefault();

    if (!selectedTask || !selectedFile) {
      alert("Please select a file before submitting.");
      return;
    }

    const newSubmission = {
      id: Date.now(),
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      project: selectedTask.project,
      fileName: selectedFile.name,
      description,
      submittedAt: new Date().toLocaleString(),
      status: "SUBMITTED"
    };

    setHistory(prev => [newSubmission, ...prev]);

    setTasks(prev =>
      prev.map(task =>
        task.id === selectedTask.id
          ? { ...task, status: "SUBMITTED" }
          : task
      )
    );

    addNotification(
      "Task Submitted Successfully",
      `Your work for ${selectedTask.title} has been submitted.`
    );

    closeSubmissionPage();
    setActivePage("history");

    alert("Task submitted successfully!");
  };

  const saveProfile = () => {
    setUser(prev => ({
      ...prev,
      name: profileName,
      email: profileEmail,
      usn: profileUSN
    }));

    addNotification(
      "Profile Updated",
      "Your profile information has been updated."
    );

    alert("Profile updated successfully!");
  };

  const uploadPhoto = e => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setUser(prev => ({
        ...prev,
        avatar: reader.result
      }));
    };

    reader.readAsDataURL(file);
  };

  const logout = () => setLoggedOut(true);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: UserRound },
    { id: "history", label: "Submission History", icon: Layers },
    { id: "tasks", label: "My Tasks", icon: ClipboardList }
  ];

  const PageTitle = ({ title, subtitle }) => (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <span className="date-chip">
        <CalendarDays size={16} />
        {new Date().toLocaleDateString()}
      </span>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, note, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <Icon size={27} />
      </div>

      <div className="stat-info">
        <p>{label}</p>
        <h2>{value}</h2>
        <span>{note}</span>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="dashboard-page">
      <section className="welcome-banner">
        <div className="welcome-symbol">
          <Layers size={58} />
        </div>

        <div className="welcome-content">
          <span className="eyebrow">
            SVCE · PROJECT MANAGEMENT
          </span>

          <h1>Student Project Management ERP</h1>

          <div className="role-pill">
            <UserRound size={18} />
            <span>My Role:</span> Team Member
          </div>

          <p>
            Welcome back, {user.name}! Manage your assigned work
            and project activities.
          </p>
        </div>

        <div className="welcome-glow-line" />
      </section>

      <div className="progress-overview">
        <div className="overview-card">
          <div className="overview-icon">
            <Layers size={32} />
          </div>

          <div className="overview-main">
            <div className="overview-label">
              <span>Project Progress</span>
              <strong>{progress}%</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon task-icon">
            <ClipboardList size={32} />
          </div>

          <div className="overview-main">
            <div className="overview-label">
              <span>Task Progress</span>
              <strong>
                {tasks.length
                  ? Math.round(
                      ((completed + history.length) /
                        Math.max(tasks.length, 1)) * 100
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    tasks.length
                      ? Math.min(
                          100,
                          ((completed + history.length) / tasks.length) * 100
                        )
                      : 0
                  }%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel task-panel">
          <div className="panel-heading">
            <h2>
              <ClipboardList size={27} />
              My Tasks
            </h2>

            <button
              className="panel-arrow"
              onClick={() => goToPage("tasks")}
              aria-label="View tasks"
            >
              <ChevronRight size={25} />
            </button>
          </div>

          {tasks.slice(0, 4).map(task => (
            <div className="task-preview" key={task.id}>
              <div className={`task-preview-icon ${task.status.toLowerCase()}`}>
                <ClipboardList size={23} />
              </div>

              <div className="task-preview-info">
                <strong>{task.title}</strong>
                <span>
                  <CalendarDays size={14} />
                  Due: {task.deadline}
                </span>
              </div>

              <span className={`status ${task.status.toLowerCase()}`}>
                {task.status.replace("_", " ")}
              </span>
            </div>
          ))}

          <button
            className="panel-link"
            onClick={() => goToPage("tasks")}
          >
            View all tasks <ChevronRight size={15} />
          </button>
        </section>

        <section className="panel submission-panel">
          <div className="panel-heading">
            <h2>
              <Layers size={27} />
              Submission History
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              <FileText size={35} />
              <p>No submissions yet</p>
              <span>Your submitted work will appear here.</span>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Submission Title</th>
                    <th>Submitted On</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {history.slice(0, 5).map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.taskTitle}</td>
                      <td>{item.submittedAt}</td>
                      <td>
                        <span className="status submitted">
                          Submitted
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            className="panel-link"
            onClick={() => goToPage("history")}
          >
            View submission history
            <ChevronRight size={15} />
          </button>
        </section>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={ClipboardList}
          label="Total Tasks"
          value={tasks.length}
          note="Assigned tasks"
          color="blue"
        />

        <StatCard
          icon={Activity}
          label="In Progress"
          value={inProgress}
          note="Currently working"
          color="purple"
        />

        <StatCard
          icon={Clock3}
          label="Pending Tasks"
          value={pending}
          note="Waiting to start"
          color="orange"
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completed}
          note="Successfully completed"
          color="green"
        />
      </div>
    </div>
  );

  const MyTasks = () => (
    <div className="content-page">
      <PageTitle
        title="My Tasks"
        subtitle="View and submit your assigned tasks."
      />

      <div className="task-status-row">
        <div className="task-status-card completed-status">
          <CheckCircle2 size={27} />
          <div>
            <h2>{completed}</h2>
            <p>Completed Tasks</p>
          </div>
        </div>

        <div className="task-status-card pending-status">
          <Clock3 size={27} />
          <div>
            <h2>{pending}</h2>
            <p>Pending Tasks</p>
          </div>
        </div>

        <div className="task-status-card progress-status">
          <Activity size={27} />
          <div>
            <h2>{inProgress}</h2>
            <p>In Progress</p>
          </div>
        </div>
      </div>

      <section className="panel table-panel">
        <h2>Assigned Tasks</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Project</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.project}</td>
                  <td>{task.deadline}</td>
                  <td>
                    <span className={`status ${task.status.toLowerCase()}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    {task.status === "SUBMITTED" ||
                    task.status === "COMPLETED" ? (
                      <span className="submitted-label">Submitted</span>
                    ) : (
                      <button
                        className="small-btn"
                        onClick={() => openSubmissionPage(task)}
                      >
                        <Upload size={15} />
                        Submit Work
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const SubmissionHistory = () => (
    <div className="content-page">
      <PageTitle
        title="Submission History"
        subtitle="View all your previously submitted task work."
      />

      <div className="history-summary">
        <div className="task-status-card completed-status">
          <History size={27} />
          <div>
            <h2>{history.length}</h2>
            <p>Total Submissions</p>
          </div>
        </div>
      </div>

      <section className="panel table-panel">
        <h2>My Submitted Work</h2>

        {history.length === 0 ? (
          <div className="empty-history">
            <History size={45} />
            <h3>No submission history</h3>
            <p>Your submitted tasks will appear here.</p>

            <button
              className="primary-btn"
              onClick={() => goToPage("tasks")}
            >
              Go to My Tasks
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Project</th>
                  <th>Uploaded File</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td>{item.taskTitle}</td>
                    <td>{item.project}</td>
                    <td>
                      <span className="file-name">
                        <FileText size={16} />
                        {item.fileName}
                      </span>
                    </td>
                    <td>{item.submittedAt}</td>
                    <td>
                      <span className="status submitted">SUBMITTED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );

  const Profile = () => (
    <div className="content-page">
      <PageTitle
        title="My Profile"
        subtitle="Manage your personal information."
      />

      <section className="panel profile-panel">
        <div className="avatar-section">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" />
            ) : (
              <UserRound size={45} />
            )}
          </div>

          <label className="small-btn photo-upload">
            <Camera size={16} />
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={uploadPhoto}
              hidden
            />
          </label>
        </div>

        <div className="profile-form">
          <label>Full Name</label>
          <input
            type="text"
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            placeholder="Enter your full name"
          />

          <label>USN (University Seat Number)</label>
          <input
            type="text"
            value={profileUSN}
            onChange={e => setProfileUSN(e.target.value.toUpperCase())}
            placeholder="Enter your USN"
          />

          <label>Email Address</label>
          <input
            type="email"
            value={profileEmail}
            onChange={e => setProfileEmail(e.target.value)}
            placeholder="Enter your email address"
          />

          <label>Department</label>
          <input type="text" value={user.department} disabled />

          <button className="primary-btn" onClick={saveProfile}>
            Save Profile
          </button>
        </div>
      </section>
    </div>
  );

  const Notifications = () => (
    <div className="content-page">
      <PageTitle
        title="Notifications"
        subtitle="View your latest updates and alerts."
      />

      {selectedNotification ? (
        <section className="panel notification-detail-panel">
          <button
            className="notification-action-btn back-notifications"
            onClick={() => setSelectedNotification(null)}
          >
            <ArrowLeft size={17} />
            Back to All Notifications
          </button>

          <div className="notification-detail-content">
            <div className="notification-detail-icon">
              <Bell size={30} />
            </div>

            <span className="notification-detail-label">
              NOTIFICATION DETAILS
            </span>

            <h2>{selectedNotification.title}</h2>

            <span className="notification-detail-time">
              {selectedNotification.time}
            </span>

            <div className="notification-detail-message">
              {selectedNotification.message}
            </div>

            <span className="status submitted">
              <CheckCircle2 size={14} />
              READ
            </span>
          </div>
        </section>
      ) : (
        <section className="panel notification-page-panel">
          <div className="notification-page-heading">
            <h2>All Notifications</h2>

            <div className="notification-actions">
              <button
                className="notification-action-btn"
                onClick={markAllRead}
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>

              <button
                className="notification-action-btn clear-action"
                onClick={clearNotifications}
              >
                Clear all
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-history">
              <Bell size={42} />
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(notification => (
              <button
                key={notification.id}
                className={`notification-page-item ${
                  notification.read ? "read" : "unread"
                }`}
                onClick={() => openNotification(notification.id)}
              >
                <div className="notification-icon">
                  <Bell size={19} />
                </div>

                <div className="notification-details">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <span>{notification.time}</span>
                </div>

                {!notification.read && (
                  <span className="unread-dot" />
                )}
              </button>
            ))
          )}
        </section>
      )}
    </div>
  );

  if (selectedTask && !loggedOut) {
    return (
      <div className="full-screen-submission">
        <div className="full-screen-submission-header">
          <div>
            <span className="submission-eyebrow">
              SVCE ERP · TASK SUBMISSION
            </span>

            <h1>Submit Your Work</h1>

            <p>{selectedTask.title}</p>
          </div>

          <button
            type="button"
            className="submission-close-button"
            onClick={closeSubmissionPage}
          >
            <X size={21} />
            Close
          </button>
        </div>

        <form
          className="full-screen-submission-form"
          onSubmit={submitTask}
        >
          <div className="submission-form-heading">
            <div>
              <h2>Submission Form</h2>
              <p>Complete the details below to submit your task.</p>
            </div>

            <span className="submission-status-tag">
              <Upload size={15} />
              NEW SUBMISSION
            </span>
          </div>

          <div className="submission-task-info">
            <div>
              <span>PROJECT NAME</span>
              <h3>{selectedTask.project}</h3>
            </div>

            <div>
              <span>TASK DEADLINE</span>
              <h3>{selectedTask.deadline}</h3>
            </div>
          </div>

          <div className="submission-field">
            <label htmlFor="submission-description">
              Submission Details
            </label>

            <p>
              Describe the work you have completed for this task.
            </p>

            <textarea
              id="submission-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter your submission details here..."
            />
          </div>

          <div className="submission-field">
            <label>Upload Files</label>

            <p>
              Upload your completed project, document, PDF or image.
            </p>

            <label className="upload-drop-area">
              <div className="upload-drop-icon">
                <Upload size={39} />
              </div>

              <strong>
                {selectedFile
                  ? selectedFile.name
                  : "Click here to upload your file"}
              </strong>

              <span>
                {selectedFile
                  ? "Your file is selected and ready to submit"
                  : "Choose a document, image, PDF or project file"}
              </span>

              <input
                type="file"
                onChange={e =>
                  setSelectedFile(e.target.files?.[0] || null)
                }
                hidden
              />
            </label>

            {selectedFile && (
              <div className="selected-file submission-selected-file">
                <FileText size={20} />

                <span>{selectedFile.name}</span>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  aria-label="Remove selected file"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="full-screen-submission-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={closeSubmissionPage}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
            >
              <Upload size={18} />
              Submit Work
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (loggedOut) {
    return (
      <div className="logout-screen">
        <div className="panel logout-panel">
          <LogOut size={45} />
          <h1>You have logged out</h1>
          <p>Your demo workspace is closed.</p>

          <button
            className="primary-btn"
            onClick={() => setLoggedOut(false)}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="background-effects">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />
      </div>

      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="brand">
          <div className="brand-icon">
            <span>S</span>
          </div>

          {sidebarOpen && (
            <div>
              <h2>SVCE ERP</h2>
              <span>PROJECT MANAGEMENT</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-link ${
                  activePage === item.id ? "active" : ""
                }`}
                onClick={() => goToPage(item.id)}
                title={item.label}
              >
                <Icon size={21} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* ROBOT ABOVE LOGOUT */}
        <div className="dashboard-robot" aria-label="Animated SVCE ERP assistant robot">
          <div className="robot-body">
            <div className="robot-head">
              <div className="robot-antenna" />
              <span className="robot-eye left" />
              <span className="robot-eye right" />
              <span className="robot-mouth" />
            </div>

            <span className="robot-arm left" />
            <span className="robot-arm right" />
          </div>

          <span className="robot-label">SVCE ASSIST</span>
        </div>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={logout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>

          <div className="sidebar-user">
            <div className="mini-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            {sidebarOpen && <span>{user.name}</span>}
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={25} />
          </button>

          <div className="topbar-heading">
            <h2>Team Member Dashboard</h2>
            <p>
              Home <ChevronRight size={15} /> Team Workspace
            </p>
          </div>

          <div className="topbar-user">
            <button
              className="topbar-bell"
              onClick={() => {
                setSelectedNotification(null);
                setSelectedTask(null);
                setActivePage("notifications");
              }}
              aria-label="Notifications"
              title="Open Notifications"
            >
              <Bell size={23} />
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </button>

            <div className="topbar-divider" />

            <div className="topbar-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <span>{user.name}</span>
          </div>
        </header>

        <div className="page-content">
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "tasks" && <MyTasks />}
          {activePage === "history" && <SubmissionHistory />}
          {activePage === "profile" && <Profile />}
          {activePage === "notifications" && <Notifications />}
        </div>
      </main>
    </div>
  );
}

export default App;
