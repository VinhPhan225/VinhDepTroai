// =================================================================
// ⚠️ CẤU HÌNH API & GLOBAL STATE ⚠️
// =================================================================
const MOCK_API_BASE = "https://693b76619b80ba7262cd5abc.mockapi.io/login/api";
const TOURS_URL = `${MOCK_API_BASE}/tour`;
const USERS_URL = `${MOCK_API_BASE}/user`;

let LOGGED_IN_USER = null;
let IS_ADMIN = false;
let authModalInstance;
let tourModalInstance;

const getFavoritesKey = () => {
  return LOGGED_IN_USER
    ? `favorite_tour_ids_${LOGGED_IN_USER.id}`
    : "favorite_tour_ids_guest";
};

// =================================================================
// CHỨC NĂNG NÂNG CAO: DARK MODE
// =================================================================

function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  loadLanguage(localStorage.getItem("language") || "vi"); // Cập nhật lại text sau khi chuyển mode
}

function loadDarkMode() {
  const darkModeSetting = localStorage.getItem("darkMode");
  const toggle = document.getElementById("darkModeToggle");

  if (darkModeSetting === "enabled") {
    document.body.classList.add("dark-mode");
    if (toggle) toggle.checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    if (toggle) toggle.checked = false;
  }
}

// =================================================================
// CHỨC NĂNG NÂNG CAO: MULTI-LANGUAGE
// =================================================================

const LANGUAGES = {
  vi: {
    "page-title": "Quản Lý Tour Du Lịch",
    "dark-mode-label": "Chế độ tối",
    "auth-login": "Đăng nhập / Đăng ký",
    "auth-logout": "Đăng xuất",
    "user-admin": "Admin",
    "user-user": "Người dùng",
    "list-title": "Danh Sách Tour",
    "search-placeholder": "Tìm kiếm theo Tên/Địa điểm...",
    "btn-add-new": "+ Thêm Tour Mới",
    "fav-list-title": "Danh sách Tour Yêu thích",
    "login-to-view-fav":
      "Vui lòng đăng nhập để xem danh sách yêu thích cá nhân.",
    "modal-add-title": "Thêm Tour Mới",
    "modal-edit-title": "Chỉnh Sửa Tour ID:",
    "btn-save-tour": "Lưu Tour",
    "label-title": "Tên Tour:",
    "label-destination": "Địa điểm:",
    "label-price": "Giá (USD):",
    "label-duration": "Thời lượng:",
    "label-description": "Mô tả:",
    authModalLabel: "Đăng nhập / Đăng ký",
    "login-tab": "Đăng nhập",
    "register-tab": "Đăng ký",
    "label-login-email": "Email:",
    "label-login-password": "Mật khẩu:",
    "btn-login": "Đăng nhập",
    "label-register-name": "Tên:",
    "label-register-email": "Email:",
    "label-register-password": "Mật khẩu:",
    "btn-register": "Đăng ký",
    "alert-login-success": (name) => `Chào mừng ${name}!`,
    "alert-logout-success": "Đã đăng xuất.",
    "alert-login-fail": "Email hoặc Mật khẩu không chính xác.",
    "alert-no-permission": "Bạn không có quyền thực hiện chức năng này.",
    "alert-delete-confirm": (id) =>
      `Bạn có chắc chắn muốn xóa Tour ID ${id} không?`,
    "alert-delete-success": (id) => `Tour ID ${id} đã được xóa.`,
    "alert-add-success": "Thêm tour thành công!",
    "alert-update-success": (id) => `Tour ID ${id} đã được cập nhật!`,
    "alert-fav-add": "Đã thêm vào danh sách yêu thích.",
    "alert-fav-remove": "Đã xóa khỏi danh sách yêu thích.",
    "btn-edit": "Sửa",
    "btn-delete": "Xóa",
    "btn-unfav": "Hủy yêu thích",
  },
  en: {
    "page-title": "Travel Tour Management",
    "dark-mode-label": "Dark Mode",
    "auth-login": "Login / Register",
    "auth-logout": "Logout",
    "user-admin": "Admin",
    "user-user": "User",
    "list-title": "Tour List",
    "search-placeholder": "Search by Name/Destination...",
    "btn-add-new": "+ Add New Tour",
    "fav-list-title": "Favorite Tour List",
    "login-to-view-fav": "Please log in to view your favorite list.",
    "modal-add-title": "Add New Tour",
    "modal-edit-title": "Edit Tour ID:",
    "btn-save-tour": "Save Tour",
    "label-title": "Tour Name:",
    "label-destination": "Destination:",
    "label-price": "Price (USD):",
    "label-duration": "Duration:",
    "label-description": "Description:",
    authModalLabel: "Login / Register",
    "login-tab": "Login",
    "register-tab": "Register",
    "label-login-email": "Email:",
    "label-login-password": "Password:",
    "btn-login": "Login",
    "label-register-name": "Name:",
    "label-register-email": "Email:",
    "label-register-password": "Password:",
    "btn-register": "Register",
    "alert-login-success": (name) => `Welcome ${name}!`,
    "alert-logout-success": "Logged out successfully.",
    "alert-login-fail": "Incorrect Email or Password.",
    "alert-no-permission":
      "You do not have permission to perform this function.",
    "alert-delete-confirm": (id) =>
      `Are you sure you want to delete Tour ID ${id}?`,
    "alert-delete-success": (id) => `Tour ID ${id} has been deleted.`,
    "alert-add-success": "Tour added successfully!",
    "alert-update-success": (id) => `Tour ID ${id} has been updated!`,
    "alert-fav-add": "Added to favorites.",
    "alert-fav-remove": "Removed from favorites.",
    "btn-edit": "Edit",
    "btn-delete": "Delete",
    "btn-unfav": "Unfavorite",
  },
};

function loadLanguage(lang) {
  const strings = LANGUAGES[lang];

  // Cập nhật DOM tĩnh
  document.getElementById("page-title").innerText = strings["page-title"];
  document.getElementById("dark-mode-label").innerText =
    strings["dark-mode-label"];
  document.getElementById("list-title").innerText = strings["list-title"];
  document.getElementById("search-input").placeholder =
    strings["search-placeholder"];

  const btnAdd = document.getElementById("btn-add-new");
  if (btnAdd) btnAdd.innerText = strings["btn-add-new"];

  document.getElementById("fav-list-title").innerText =
    strings["fav-list-title"];
  document.getElementById("login-to-view-fav").innerText =
    strings["login-to-view-fav"];

  // Cập nhật Modal Tour
  document.getElementById("tourModalLabel").innerText =
    strings["modal-add-title"];
  document.getElementById("label-title").innerText = strings["label-title"];
  document.getElementById("label-destination").innerText =
    strings["label-destination"];
  document.getElementById("label-price").innerText = strings["label-price"];
  document.getElementById("label-duration").innerText =
    strings["label-duration"];
  document.getElementById("label-description").innerText =
    strings["label-description"];
  document.getElementById("btn-save-tour").innerText = strings["btn-save-tour"];

  // Cập nhật Modal Auth
  document.getElementById("authModalLabel").innerText =
    strings["authModalLabel"];
  document.getElementById("login-tab").innerText = strings["login-tab"];
  document.getElementById("register-tab").innerText = strings["register-tab"];
  document.getElementById("label-login-email").innerText =
    strings["label-login-email"];
  document.getElementById("label-login-password").innerText =
    strings["label-login-password"];
  document.getElementById("btn-login").innerText = strings["btn-login"];
  document.getElementById("label-register-name").innerText =
    strings["label-register-name"];
  document.getElementById("label-register-email").innerText =
    strings["label-register-email"];
  document.getElementById("label-register-password").innerText =
    strings["label-register-password"];
  document.getElementById("btn-register").innerText = strings["btn-register"];

  // Cập nhật trạng thái người dùng (cần gọi lại checkAuthState để cập nhật nút Đăng nhập/Đăng xuất)
  checkAuthState();
}

function setLanguage(lang) {
  localStorage.setItem("language", lang);
  loadLanguage(lang);
}

// =================================================================
// LOGIC AUTHENTICATION VÀ PHÂN QUYỀN (Cập nhật để sử dụng đa ngôn ngữ)
// =================================================================

function checkAuthState() {
  const user = sessionStorage.getItem("loggedInUser");
  if (user) {
    LOGGED_IN_USER = JSON.parse(user);
    IS_ADMIN = LOGGED_IN_USER.role === true;
  } else {
    LOGGED_IN_USER = null;
    IS_ADMIN = false;
  }
  updateUIVisibility();
}

function handleLogout() {
  const lang = localStorage.getItem("language") || "vi";
  sessionStorage.removeItem("loggedInUser");
  LOGGED_IN_USER = null;
  IS_ADMIN = false;
  alert(LANGUAGES[lang]["alert-logout-success"]);
  checkAuthState();
}

function updateUIVisibility() {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  const btnAdd = document.getElementById("btn-add-new");
  const authButton = document.getElementById("auth-button");
  const userInfo = document.getElementById("user-info");

  // Nút Thêm Tour (Admin)
  if (btnAdd) {
    btnAdd.style.display = IS_ADMIN ? "block" : "none";
  }

  // Nút Đăng nhập/Đăng xuất
  if (LOGGED_IN_USER) {
    authButton.innerText = strings["auth-logout"];
    authButton.className = "btn btn-sm btn-outline-danger";
    authButton.onclick = handleLogout;
    userInfo.innerHTML = `Xin chào, <b>${LOGGED_IN_USER.name}</b> (${
      IS_ADMIN ? strings["user-admin"] : strings["user-user"]
    })`;
  } else {
    authButton.innerText = strings["auth-login"];
    authButton.className = "btn btn-sm btn-primary";
    authButton.onclick = () => {
      authModalInstance.show();
    };
    userInfo.innerHTML = "";
  }

  // Tải lại danh sách để ẩn/hiện nút Sửa/Xóa và Yêu thích
  loadTours();
  renderFavoriteList();
}

// --------------------------------------------------
// LOGIC XỬ LÝ FORM ĐĂNG NHẬP VÀ ĐĂNG KÝ
// --------------------------------------------------
async function handleLoginFormSubmit(e) {
  e.preventDefault();
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(USERS_URL);
    const users = await response.json();
    const authenticatedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (authenticatedUser) {
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          role: authenticatedUser.role,
        })
      );

      authModalInstance.hide();
      alert(strings["alert-login-success"](authenticatedUser.name));
      checkAuthState();
    } else {
      alert(strings["alert-login-fail"]);
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    alert("Đã xảy ra lỗi hệ thống.");
  }
}

async function handleRegisterFormSubmit(e) {
  e.preventDefault();
  const lang = localStorage.getItem("language") || "vi";

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const newUser = { name, email, password, role: false };

  try {
    const checkResponse = await fetch(USERS_URL);
    const existingUsers = await checkResponse.json();
    const isEmailDuplicate = existingUsers.some((user) => user.email === email);

    if (isEmailDuplicate) {
      alert("Email này đã được đăng ký.");
      return;
    }

    const createResponse = await fetch(USERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (createResponse.ok) {
      alert("Đăng ký thành công! Hãy đăng nhập.");

      const loginTabButton = document.getElementById("login-tab");
      bootstrap.Tab.getInstance(loginTabButton).show();

      document.getElementById("register-form").reset();
    } else {
      throw new Error("Lỗi khi tạo tài khoản.");
    }
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    alert("Đã xảy ra lỗi hệ thống khi đăng ký.");
  }
}

// =================================================================
// INIT & EVENT LISTENERS
// =================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo Modal Instances
  const authModalElement = document.getElementById("authModal");
  if (authModalElement) {
    authModalInstance = new bootstrap.Modal(authModalElement);
  }
  const tourModalElement = document.getElementById("tourModal");
  if (tourModalElement) {
    tourModalInstance = new bootstrap.Modal(tourModalElement);
  }

  // Load Dark Mode và Language trước khi kiểm tra Auth
  loadDarkMode();
  const savedLang = localStorage.getItem("language") || "vi";
  document.getElementById("lang-select").value = savedLang;
  loadLanguage(savedLang); // Tải ngôn ngữ và gọi checkAuthState

  // Gán sự kiện cho các Form
  document
    .getElementById("login-form")
    .addEventListener("submit", handleLoginFormSubmit);
  document
    .getElementById("register-form")
    .addEventListener("submit", handleRegisterFormSubmit);
  document
    .getElementById("tour-form")
    .addEventListener("submit", handleFormSubmit);

  // Reset Modal khi đóng
  document
    .getElementById("tourModal")
    .addEventListener("hidden.bs.modal", resetForm);

  document.getElementById("btn-add-new").addEventListener("click", () => {
    const lang = localStorage.getItem("language") || "vi";
    document.getElementById("tourModalLabel").innerText =
      LANGUAGES[lang]["modal-add-title"];
    document.getElementById("tour-id").value = "";
  });
});

function resetForm() {
  const lang = localStorage.getItem("language") || "vi";
  document.getElementById("tour-form").reset();
  document.getElementById("tour-id").value = "";
  document.getElementById("tourModalLabel").innerText =
    LANGUAGES[lang]["modal-add-title"];
}

// =================================================================
// 🔍 READ & RENDER
// =================================================================

async function loadTours(searchTerm = "") {
  try {
    const response = await fetch(TOURS_URL);
    if (!response.ok) throw new Error("Không tải được danh sách tour.");

    let tours = await response.json();

    if (searchTerm) {
      const lowerCaseTerm = searchTerm.toLowerCase();
      tours = tours.filter(
        (tour) =>
          (tour.title && tour.title.toLowerCase().includes(lowerCaseTerm)) ||
          (tour.destination &&
            tour.destination.toLowerCase().includes(lowerCaseTerm))
      );
    }

    renderTours(tours);
  } catch (error) {
    console.error("Lỗi tải tours:", error);
    document.getElementById("tour-list-container").innerHTML =
      '<div class="col-12"><p class="text-center text-danger">Không tải được dữ liệu tour từ API. Vui lòng kiểm tra lại URL MockAPI.</p></div>';
  }
}

function renderTours(tours) {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  const container = document.getElementById("tour-list-container");
  const favorites = getFavorites();

  const htmlContent = tours
    .map((tour) => {
      const isFav = favorites.includes(Number(tour.id));
      const favIconClass = isFav ? "favorite" : "not-favorite";

      const adminControls = IS_ADMIN
        ? `
                    <div class="mt-2 pt-2 border-top">
                        <button class="btn btn-sm btn-info me-2" onclick="handleEditClick('${tour.id}')">${strings["btn-edit"]}</button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDelete('${tour.id}')">${strings["btn-delete"]}</button>
                    </div>
                `
        : "";

      return `
                <div class="col">
                    <div class="card h-100 tour-card shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start">
                                <h5 class="card-title text-primary">${
                                  tour.title || "N/A"
                                }</h5>
                                <span class="${favIconClass}" onclick="handleFavoriteClick('${
        tour.id
      }')">★</span>
                            </div>
                            
                            <p class="card-text text-muted mb-1">${
                              tour.destination || "N/A"
                            }</p>
                            
                            <div class="d-flex justify-content-between align-items-end mt-auto pt-2">
                                <span class="tour-price">${
                                  tour.price
                                    ? tour.price.toLocaleString()
                                    : "N/A"
                                } USD</span>
                                <span class="badge bg-success">${
                                  tour.duration || "N/A"
                                }</span>
                            </div>
                            
                            ${adminControls}

                        </div>
                    </div>
                </div>
            `;
    })
    .join("");

  container.innerHTML = htmlContent;
}

// =================================================================
// CRUD (CREATE, UPDATE, DELETE)
// =================================================================

async function handleFormSubmit(event) {
  event.preventDefault();
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  if (!IS_ADMIN) return alert(strings["alert-no-permission"]);

  const id = document.getElementById("tour-id").value;
  const tourData = {
    title: document.getElementById("title").value,
    destination: document.getElementById("destination").value,
    price: parseFloat(document.getElementById("price").value),
    duration: document.getElementById("duration").value,
    description: document.getElementById("description").value,
  };

  try {
    if (id) {
      await updateTour(id, tourData);
    } else {
      await addTour(tourData);
    }

    tourModalInstance.hide();
  } catch (error) {
    console.error("Lỗi xử lý Form:", error);
    alert("Có lỗi xảy ra khi lưu tour.");
  }
}

async function addTour(data) {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  const response = await fetch(TOURS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi thêm tour.");
  alert(strings["alert-add-success"]);
  loadTours();
}

async function updateTour(id, data) {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  const updateUrl = `${TOURS_URL}/${id}`;
  const response = await fetch(updateUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi sửa tour.");
  alert(strings["alert-update-success"](id));
  loadTours();
}

function confirmDelete(id) {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  if (!IS_ADMIN) return alert(strings["alert-no-permission"]);
  if (confirm(strings["alert-delete-confirm"](id))) {
    handleDeleteTour(id);
  }
}

async function handleDeleteTour(id) {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  const deleteUrl = `${TOURS_URL}/${id}`;
  try {
    const response = await fetch(deleteUrl, { method: "DELETE" });
    if (!response.ok) throw new Error("Lỗi khi xóa tour.");

    alert(strings["alert-delete-success"](id));
    loadTours();
    renderFavoriteList();
  } catch (error) {
    console.error("Lỗi DELETE:", error);
    alert("Không thể xóa tour.");
  }
}

async function handleEditClick(id) {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  if (!IS_ADMIN) return alert(strings["alert-no-permission"]);
  try {
    const response = await fetch(`${TOURS_URL}/${id}`);
    const tour = await response.json();

    document.getElementById("tour-id").value = tour.id;
    document.getElementById("title").value = tour.title || "";
    document.getElementById("destination").value = tour.destination || "";
    document.getElementById("price").value = tour.price || 0;
    document.getElementById("duration").value = tour.duration || "";
    document.getElementById("description").value = tour.description || "";

    document.getElementById(
      "tourModalLabel"
    ).innerText = `${strings["modal-edit-title"]} ${id}`;

    tourModalInstance.show();
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tour để sửa:", error);
    alert("Không thể lấy dữ liệu tour để chỉnh sửa.");
  }
}

// =================================================================
// YÊU THÍCH (LOCAL STORAGE)
// =================================================================

function handleFavoriteClick(tourId) {
  if (!LOGGED_IN_USER) {
    // Thông báo bằng tiếng Việt (hoặc ngôn ngữ mặc định) nếu chưa kịp load ngôn ngữ
    alert(
      "Bạn cần Đăng nhập hoặc Đăng ký để thêm tour vào danh sách yêu thích."
    );
    authModalInstance.show();
    return;
  }
  toggleFavorite(tourId);
}

function getFavorites() {
  const key = getFavoritesKey();
  const favorites = localStorage.getItem(key);

  return favorites ? JSON.parse(favorites).map(Number) : [];
}

function saveFavorites(favoritesArray) {
  const key = getFavoritesKey();
  localStorage.setItem(key, JSON.stringify(favoritesArray));
}

function toggleFavorite(tourIdStr) {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  const tourId = Number(tourIdStr);
  let favorites = getFavorites();

  const index = favorites.indexOf(tourId);

  if (index > -1) {
    favorites.splice(index, 1);
    alert(strings["alert-fav-remove"]);
  } else {
    favorites.push(tourId);
    alert(strings["alert-fav-add"]);
  }

  saveFavorites(favorites);
  loadTours();
  renderFavoriteList();
}

async function renderFavoriteList() {
  const lang = localStorage.getItem("language") || "vi";
  const strings = LANGUAGES[lang];

  const favContainer = document.getElementById("favorite-list");

  if (!LOGGED_IN_USER) {
    favContainer.innerHTML = `<li class="list-group-item text-muted" id="login-to-view-fav">${strings["login-to-view-fav"]}</li>`;
    return;
  }

  const favoriteIds = getFavorites();

  if (favoriteIds.length === 0) {
    favContainer.innerHTML =
      '<li class="list-group-item text-muted">Danh sách yêu thích của bạn đang trống.</li>';
    return;
  }

  try {
    const response = await fetch(TOURS_URL);
    if (!response.ok) throw new Error("API Error fetching tours.");

    const allTours = await response.json();

    const favoriteTours = allTours.filter((tour) =>
      favoriteIds.includes(Number(tour.id))
    );

    if (favoriteTours.length === 0 && favoriteIds.length > 0) {
      // Trường hợp IDs còn nhưng tour bị xóa khỏi API
      favContainer.innerHTML =
        '<li class="list-group-item text-muted">Danh sách yêu thích của bạn đang trống.</li>';
      return;
    }

    const favHtml = favoriteTours
      .map(
        (tour) => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span class="fw-bold">${tour.title}</span> 
            <span class="badge bg-secondary">${tour.destination}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="toggleFavorite('${tour.id}')">
              ${strings["btn-unfav"]}
            </button>
          </li>
        `
      )
      .join("");

    favContainer.innerHTML = favHtml;
  } catch (error) {
    console.error("LỖI KHI TẢI DANH SÁCH YÊU THÍCH:", error);
    favContainer.innerHTML =
      '<li class="list-group-item text-danger">Lỗi nghiêm trọng: Không tải được chi tiết tour từ API. Vui lòng kiểm tra console.</li>';
  }
}
