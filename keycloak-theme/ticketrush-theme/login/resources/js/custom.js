document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // 1. TÍNH NĂNG: VIỆT HÓA 100% BẰNG JAVASCRIPT (TRỪ "TICKETRUSH")
    // ==========================================

    // Hàm tiện ích để thay đổi text an toàn
    const changeText = (selector, newText) => {
        const el = document.querySelector(selector);
        if (el) el.childNodes.forEach(node => {
            // Chỉ thay thế text node, giữ nguyên các icon/span bên trong
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
                node.nodeValue = newText;
            }
        });
    };

    // --- TRANG CHUNG ---
    // Tiêu đề trang
    changeText("#kc-page-title",
        document.body.dataset.pageId === "login-login" ? "Đăng nhập tài khoản" : "Đăng ký tài khoản"
    );

    // --- TRANG ĐĂNG NHẬP ---
    // Nhãn ô nhập liệu
    changeText("label[for='username'] .pf-v5-c-form__label-text", "Tên đăng nhập hoặc Email");
    changeText("label[for='password'] .pf-v5-c-form__label-text", "Mật khẩu");
    changeText(".pf-v5-c-check__label", "Ghi nhớ tài khoản");

    // Liên kết
    const forgotPassLink = document.querySelector("a[href*='reset-credentials']");
    if (forgotPassLink) forgotPassLink.textContent = "Quên mật khẩu?";

    // Nút
    const loginBtn = document.getElementById("kc-login");
    if (loginBtn) loginBtn.textContent = "Đăng nhập";

    // Social
    const orSignInWith = document.querySelector(".pf-v5-c-login__main-footer-band-item");
    if (orSignInWith && orSignInWith.textContent.includes("Or sign in with")) {
        orSignInWith.textContent = "Hoặc đăng nhập bằng";
    }

    // Đăng ký mới
    const registerContainer = document.querySelector("#kc-registration span");
    if (registerContainer) {
        registerContainer.innerHTML = `Chưa có tài khoản? <a href="${registerContainer.querySelector('a').href}">Đăng ký ngay</a>`;
    }

    // --- TRANG ĐĂNG KÝ ---
    // Nhãn ô nhập liệu
    changeText("label[for='password-confirm'] .pf-v5-c-form__label-text", "Xác nhận mật khẩu");
    changeText("label[for='email'] .pf-v5-c-form__label-text", "Email");
    changeText("label[for='firstName'] .pf-v5-c-form__label-text", "Tên");
    changeText("label[for='lastName'] .pf-v5-c-form__label-text", "Họ");

    // Thông tin bổ sung
    const headerMetadata = document.getElementById("header-user-metadata");
    if (headerMetadata) headerMetadata.textContent = "Thông tin bổ sung";

    // Tùy chọn Giới tính
    const genderSelect = document.getElementById("gender");
    if (genderSelect) {
        for (let option of genderSelect.options) {
            if (option.value === "MALE") option.text = "Nam";
            if (option.value === "FEMALE") option.text = "Nữ";
        }
    }

    // Nút
    const registerBtn = document.querySelector("#kc-register-form input[type='submit']");
    if (registerBtn) registerBtn.value = "Đăng ký";

    // Liên kết quay lại
    const backToLoginLink = document.querySelector("a[href*='login-actions/authenticate']");
    if (backToLoginLink) backToLoginLink.textContent = "« Quay lại đăng nhập";

    // Placeholder
    const usernameInput = document.getElementById("username");
    if (usernameInput) usernameInput.placeholder = "Nhập email hoặc tên đăng nhập";
    const passwordInput = document.getElementById("password");
    if (passwordInput) passwordInput.placeholder = "••••••••";


    // ==========================================
    // 2. TÍNH NĂNG: NÚT QUAY LẠI TRANG CHỦ
    // ==========================================
    const formContainer = document.getElementById("kc-form");

    if (formContainer && !document.getElementById("back-to-home-link")) {
        const backBtn = document.createElement("a");
        backBtn.id = "back-to-home-link";
        backBtn.href = "http://localhost:5173/"; // Link về trang chủ dự án của bạn
        backBtn.innerHTML = "← Quay lại trang chủ";

        // Đẩy nút vào ngay sau box Form trắng
        formContainer.parentNode.insertBefore(backBtn, formContainer.nextSibling);
    }
});