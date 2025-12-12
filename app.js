// =================================================================
// ⚠️ CẤU HÌNH API & GLOBAL STATE ⚠️
// Vui lòng kiểm tra và thay thế URL của bạn
// =================================================================
const MOCK_API_BASE = "https://693b76619b80ba7262cd5abc.mockapi.io/login/api";
const TOURS_URL = `${MOCK_API_BASE}/tour`;
const USERS_URL = `${MOCK_API_BASE}/user`;

let LOGGED_IN_USER = null;
let IS_ADMIN = false;
let authModalInstance;
let tourModalInstance;

const FAVORITES_KEY = "favorite_tour_ids";

// =================================================================
// LOGIC AUTHENTICATION VÀ PHÂN QUYỀN
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
  sessionStorage.removeItem("loggedInUser");
  LOGGED_IN_USER = null;
  IS_ADMIN = false;
  alert("Đã đăng xuất.");
  checkAuthState();
}

function updateUIVisibility() {
  const btnAdd = document.getElementById("btn-add-new");
  const authButton = document.getElementById("auth-button");
  const userInfo = document.getElementById("user-info");

  // Nút Thêm Tour (Admin)
  if (btnAdd) {
    btnAdd.style.display = IS_ADMIN ? "block" : "none";
  }

  // Nút Đăng nhập/Đăng xuất
  if (LOGGED_IN_USER) {
    authButton.innerText = "Đăng xuất";
    authButton.className = "btn btn-sm btn-outline-danger";
    authButton.onclick = handleLogout;
    userInfo.innerHTML = `Xin chào, <b>${LOGGED_IN_USER.name}</b> (${
      IS_ADMIN ? "Admin" : "User"
    })`;
  } else {
    authButton.innerText = "Đăng nhập / Đăng ký";
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
      alert(`Chào mừng ${authenticatedUser.name}!`);
      checkAuthState();
    } else {
      alert("Email hoặc Mật khẩu không chính xác.");
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    alert("Đã xảy ra lỗi hệ thống.");
  }
}

async function handleRegisterFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const newUser = { name, email, password, role: false };

  try {
    // KIỂM TRA TRÙNG LẶP
    const checkResponse = await fetch(USERS_URL);
    const existingUsers = await checkResponse.json();
    const isEmailDuplicate = existingUsers.some((user) => user.email === email);

    if (isEmailDuplicate) {
      alert("Email này đã được đăng ký.");
      return;
    }

    // TẠO MỚI
    const createResponse = await fetch(USERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (createResponse.ok) {
      alert("Đăng ký thành công! Hãy đăng nhập.");

      // Chuyển sang tab Login
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
// INIT & EVENT LISTENERS (Khởi tạo)
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

  checkAuthState();

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
    document.getElementById("tourModalLabel").innerText = "Thêm Tour Mới";
    document.getElementById("tour-id").value = "";
  });
});

function resetForm() {
  document.getElementById("tour-form").reset();
  document.getElementById("tour-id").value = "";
  document.getElementById("tourModalLabel").innerText = "Thêm Tour Mới";
}

// =================================================================
// 🔍 READ & RENDER (Lọc/Tìm kiếm)
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
    // Sau khi render xong, ẩn/hiện cột Admin Controls
    toggleAdminColumns(IS_ADMIN);
  } catch (error) {
    console.error("Lỗi tải tours:", error);
    document.getElementById("tour-list-container").innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Không tải được dữ liệu tour từ API. Vui lòng kiểm tra lại URL MockAPI.</td></tr>';
  }
}

function toggleAdminColumns(isVisible) {
  const table = document.querySelector(".tour-table");
  if (!table) return;

  // Lấy tất cả các ô tiêu đề và nội dung cần ẩn (cột thứ 5 là 'Thao tác Admin')
  const adminHeader = table.querySelector("thead tr th:nth-child(5)");
  const adminBodyCells = table.querySelectorAll("tbody tr td:nth-child(5)");

  const displayStyle = isVisible ? "table-cell" : "none";

  if (adminHeader) {
    adminHeader.style.display = displayStyle;
  }
  adminBodyCells.forEach((cell) => {
    cell.style.display = displayStyle;
  });
}

function renderTours(tours) {
  const container = document.getElementById("tour-list-container");
  const favorites = getFavorites();

  const htmlContent = tours
    .map((tour) => {
      const isFav = favorites.includes(Number(tour.id));
      const favIconClass = isFav ? "favorite" : "not-favorite";

      // ❌ LOGIC PHÂN QUYỀN: Ẩn/Hiện nút Sửa/Xóa
      const adminControls = IS_ADMIN
        ? `
            <button class="btn btn-sm btn-info me-2" onclick="handleEditClick('${tour.id}')">Sửa</button>
            <button class="btn btn-sm btn-danger" onclick="confirmDelete('${tour.id}')">Xóa</button>
        `
        : "";

      return `
            <tr>
                <td>${tour.title || "N/A"}</td>
                <td>${tour.destination || "N/A"}</td>
                <td>${tour.price ? tour.price.toLocaleString() : "N/A"} USD</td>
                <td>${tour.duration || "N/A"}</td>

                <td class="text-center admin-column">${adminControls}</td>
                
                <td>
                    <span class="${favIconClass}" onclick="handleFavoriteClick('${
        tour.id
      }')">★</span>
                </td>
            </tr>
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
  if (!IS_ADMIN) return alert("Bạn không có quyền thực hiện chức năng này.");

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
  const response = await fetch(TOURS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi thêm tour.");
  alert("Thêm tour thành công!");
  loadTours();
}

async function updateTour(id, data) {
  const updateUrl = `${TOURS_URL}/${id}`;
  const response = await fetch(updateUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi sửa tour.");
  alert(`Tour ID ${id} đã được cập nhật!`);
  loadTours();
}

function confirmDelete(id) {
  if (!IS_ADMIN) return alert("Bạn không có quyền xóa tour.");
  if (confirm(`Bạn có chắc chắn muốn xóa Tour ID ${id} không?`)) {
    handleDeleteTour(id);
  }
}

async function handleDeleteTour(id) {
  const deleteUrl = `${TOURS_URL}/${id}`;
  try {
    const response = await fetch(deleteUrl, { method: "DELETE" });
    if (!response.ok) throw new Error("Lỗi khi xóa tour.");

    alert(`Tour ID ${id} đã được xóa.`);
    loadTours();
    renderFavoriteList();
  } catch (error) {
    console.error("Lỗi DELETE:", error);
    alert("Không thể xóa tour.");
  }
}

async function handleEditClick(id) {
  if (!IS_ADMIN) return alert("Bạn không có quyền chỉnh sửa tour.");
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
    ).innerText = `Chỉnh Sửa Tour ID: ${id}`;

    tourModalInstance.show();
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tour để sửa:", error);
    alert("Không thể lấy dữ liệu tour để chỉnh sửa.");
  }
}

// =================================================================
// YÊU THÍCH (LOCAL STORAGE) - ĐÃ TỐI ƯU HIỂN THỊ
// =================================================================

function handleFavoriteClick(tourId) {
  if (!LOGGED_IN_USER) {
    alert(
      "Bạn cần Đăng nhập hoặc Đăng ký để thêm tour vào danh sách yêu thích."
    );
    authModalInstance.show();
    return;
  }
  toggleFavorite(tourId);
}

function getFavorites() {
  const favorites = localStorage.getItem(FAVORITES_KEY);
  return favorites ? JSON.parse(favorites).map(Number) : [];
}

function saveFavorites(favoritesArray) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
}

function toggleFavorite(tourIdStr) {
  const tourId = Number(tourIdStr);
  let favorites = getFavorites();

  const index = favorites.indexOf(tourId);

  if (index > -1) {
    favorites.splice(index, 1);
    alert("Đã xóa khỏi danh sách yêu thích.");
  } else {
    favorites.push(tourId);
    alert("Đã thêm vào danh sách yêu thích.");
  }

  saveFavorites(favorites);
  // Gọi cả hai hàm để đảm bảo giao diện được cập nhật đồng bộ
  loadTours();
  renderFavoriteList();
}

async function renderFavoriteList() {
  const favContainer = document.getElementById("favorite-list");

  if (!LOGGED_IN_USER) {
    favContainer.innerHTML =
      '<li class="list-group-item text-muted">Vui lòng đăng nhập để xem danh sách yêu thích.</li>';
    return;
  }

  const favoriteIds = getFavorites();

  if (favoriteIds.length === 0) {
    favContainer.innerHTML =
      '<li class="list-group-item text-muted">Danh sách yêu thích của bạn đang trống.</li>';
    return;
  }

  try {
    // Lấy toàn bộ tour từ API
    const response = await fetch(TOURS_URL);
    if (!response.ok) throw new Error("API Error fetching tours.");

    const allTours = await response.json();

    // Lọc: Chỉ lấy những tour có ID nằm trong Local Storage
    // Đảm bảo so sánh kiểu dữ liệu Number với Number
    const favoriteTours = allTours.filter((tour) =>
      favoriteIds.includes(Number(tour.id))
    );

    const favHtml = favoriteTours
      .map(
        (tour) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="fw-bold">${tour.title}</span> 
                <span class="badge bg-secondary">${tour.destination}</span>
                <button class="btn btn-sm btn-outline-danger" onclick="toggleFavorite('${tour.id}')">
                    Hủy yêu thích
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
