const API_URL = "https://script.google.com/macros/s/AKfycbzAjKS3P8DSQqxn9DC0W3WzJMIG3gcZQQE-tiy4o0Xd1fZ_QFDkHLUZZ87Xbr_Qcaroww/exec";

let user = {};
let editRow = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const fotoInput = document.getElementById("foto");

  if (fotoInput) {
    fotoInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("File harus gambar");
        this.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById("previewImg");
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = "block";
        }
      };

      reader.readAsDataURL(file);
    });
  }
});

// ================= LOGIN =================
async function login() {
  const nama = document.getElementById("nama").value;
  const pin = document.getElementById("pin").value;

  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "login", nama, pin })
  });

  const data = await res.json();

  if (data.status === "success") {
    user = data;

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appBox").style.display = "block";

    document.getElementById("userInfo").innerText =
      "Login: " + user.nama + " (" + user.role + ")";

    setTanggal();
    loadData();
  } else {
    alert("Login gagal");
  }
}

// ================= LOGOUT =================
function logout() {
  user = {};
  editRow = null;

  document.getElementById("loginBox").style.display = "block";
  document.getElementById("appBox").style.display = "none";

  document.getElementById("nama").value = "";
  document.getElementById("pin").value = "";
}

// ================= TANGGAL =================
function setTanggal() {
  const now = new Date();
  document.getElementById("tanggal").value = now.toLocaleString();
}

// ================= BASE64 =================
function toBase64(file) {
  return new Promise((resolve) => {
    if (!file) return resolve("");

    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result || "");
    reader.onerror = () => resolve("");

    reader.readAsDataURL(file);
  });
}

// ================= SIMPAN =================
async function simpan() {
  const fileInput = document.getElementById("foto");
  const file = fileInput.files[0];

  let base64 = "";

  if (file) {
    base64 = await toBase64(file);
    console.log("Foto size:", base64.length);
  }

  const action = editRow ? "edit" : "save";

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action,
      row: editRow,
      nama: user.nama,
      tanggal: document.getElementById("tanggal").value,
      lokasi: document.getElementById("lokasi").value,
      pekerjaan: document.getElementById("pekerjaan").value,
      deskripsi: document.getElementById("deskripsi").value,
      status: document.getElementById("status").value,
      foto: base64
    })
  });

  // RESET
  fileInput.value = "";
  editRow = null;

  const preview = document.getElementById("previewImg");
  if (preview) {
    preview.style.display = "none";
    preview.src = "";
  }

  setTanggal();
  loadData();
}

// ================= LOAD DATA =================
async function loadData() {
  const res = await fetch(API_URL + "?nama=" + user.nama + "&role=" + user.role);
  const data = await res.json();

  let html = "";

  if (!data.length) {
    html = `<div class="alert alert-warning">Belum ada laporan</div>`;
  }

  data.forEach(d => {
    html += `
    <div class="card mb-3">
      <div class="card-body">

        <h6>${d.pekerjaan}</h6>

        <small><b>${d.nama}</b> | ${d.tanggal} | ${d.lokasi}</small>

        <p>${d.deskripsi}</p>

        <span class="badge bg-info">${d.status}</span>
        <span class="badge bg-${d.approval === 'Approved' ? 'success' : 'warning'}">
          ${d.approval}
        </span>

        ${d.foto ? `
          <img src="${d.foto}"
               class="img-fluid mt-2 rounded"
               style="max-height:150px; cursor:pointer;"
               onclick="showImg('${d.foto}')"
               onerror="this.style.display='none'">
        ` : ""}

        <div class="mt-2">

          ${d.approval !== "Approved" ? `
            <button onclick="editData(${d.row}, '${d.tanggal}', '${d.lokasi}', '${d.pekerjaan}', '${d.deskripsi}', '${d.status}')"
              class="btn btn-sm btn-warning">Edit</button>

            <button onclick="hapus(${d.row})"
              class="btn btn-sm btn-danger">Hapus</button>
          ` : ""}

          ${user.role === "admin" && d.approval !== "Approved" ? `
            <button onclick="approve(${d.row})"
              class="btn btn-sm btn-primary">Approve</button>
          ` : ""}

        </div>

      </div>
    </div>
    `;
  });

  document.getElementById("listData").innerHTML = html;
}

// ================= EDIT =================
function editData(row, t, l, p, d, s) {
  editRow = row;

  document.getElementById("tanggal").value = t;
  document.getElementById("lokasi").value = l;
  document.getElementById("pekerjaan").value = p;
  document.getElementById("deskripsi").value = d;
  document.getElementById("status").value = s;
}

// ================= DELETE =================
async function hapus(row) {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "delete", row })
  });

  loadData();
}

// ================= APPROVE =================
async function approve(row) {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "approve", row })
  });

  loadData();
}

// ================= ZOOM FOTO =================
function showImg(src) {
  document.getElementById("modalImg").src = src;
  new bootstrap.Modal(document.getElementById("imgModal")).show();
}
