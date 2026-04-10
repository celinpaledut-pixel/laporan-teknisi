const API = "https://script.google.com/macros/s/AKfycbyjPUhpzXNFEXfiD3eJXqeHmsfcRpMU-HnR6lv4w8RdD876Jm8Y-ZkWasGioXbipEhaIg/exec";

// ================= STATE =================
let fotoBase64 = "";
let editMode = false;
let editRow = null;

function fixImageUrl(url) {
  if (!url) return "";

  // format: /file/d/ID/view
  const match = url.match(/\/d\/(.*?)\//);
  if (match) {
    return "https://drive.google.com/uc?id=" + match[1];
  }

  // sudah format uc?id
  if (url.includes("uc?id=")) return url;

  // fallback
  return url;
}
// ================= FOTO =================
function previewFoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    fotoBase64 = evt.target.result;

    const img = document.getElementById("preview");
    img.src = fotoBase64;
    img.style.display = "block";
  };

  reader.readAsDataURL(file);
}

// ================= HELPER =================
function val(id) {
  return document.getElementById(id)?.value || "";
}

// ================= LOGIN =================
async function login() {
  const nama = val("loginNama");
  const pin = val("loginPin");

  if (!nama || !pin) return alert("Isi semua!");

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "login", nama, pin })
    });

    const json = await res.json();

    if (json.status === "success") {
      localStorage.setItem("user", JSON.stringify(json));
      initApp();
    } else {
      alert("Login gagal");
    }

  } catch {
    alert("Koneksi gagal");
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// ================= INIT =================
function initApp() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("appBox").style.display = "block";

  document.getElementById("nama").value = user.nama;
  document.getElementById("roleBadge").innerText = user.role;

  setTanggalNow();
  loadData();
}

// ================= TANGGAL =================
function setTanggalNow() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  document.getElementById("tanggal").value = local;
}

// ================= SUBMIT =================
function submitForm(e) {
  if (editMode) {
    updateData();
  } else {
    kirim(e);
  }
}

// ================= KIRIM =================
async function kirim(e) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Login dulu");

  if (!fotoBase64) return alert("Foto wajib");

  const btn = document.getElementById("btnSubmit");
  btn.disabled = true;
  btn.innerText = "Mengirim...";

  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "save",
        nama: user.nama,
        tanggal: val("tanggal"),
        lokasi: val("lokasi"),
        pekerjaan: val("pekerjaan"),
        deskripsi: val("deskripsi"),
        status: val("status"),
        foto: fotoBase64
      })
    });

    alert("Berhasil");
    clearForm();
    loadData();

  } catch {
    alert("Gagal kirim");
  }

  btn.disabled = false;
  btn.innerText = "🚀 Kirim Laporan";
}

// ================= EDIT MODE =================
function editData(row, data) {
  editMode = true;
  editRow = row;

  document.getElementById("tanggal").value = data.tanggal;
  document.getElementById("lokasi").value = data.lokasi;
  document.getElementById("pekerjaan").value = data.pekerjaan;
  document.getElementById("deskripsi").value = data.deskripsi;
  document.getElementById("status").value = data.status;

  document.getElementById("btnSubmit").innerText = "💾 Update";
  document.getElementById("btnCancel").style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function updateData() {
  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "edit",
        row: editRow,
        tanggal: val("tanggal"),
        lokasi: val("lokasi"),
        pekerjaan: val("pekerjaan"),
        deskripsi: val("deskripsi"),
        status: val("status")
      })
    });

    alert("Update berhasil");

    batalEdit();
    loadData();

  } catch {
    alert("Gagal update");
  }
}

function batalEdit() {
  editMode = false;
  editRow = null;

  document.getElementById("btnSubmit").innerText = "🚀 Kirim Laporan";
  document.getElementById("btnCancel").style.display = "none";

  clearForm();
}

// ================= DELETE =================
async function hapus(row) {
  if (!confirm("Hapus laporan?")) return;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "delete", row })
  });

  loadData();
}

// ================= APPROVE =================
async function approve(row) {
  if (!confirm("Approve laporan?")) return;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "approve", row })
  });

  loadData();
}

// ================= CLEAR =================
function clearForm() {
  document.getElementById("lokasi").value = "";
  document.getElementById("pekerjaan").value = "";
  document.getElementById("deskripsi").value = "";
  fotoBase64 = "";

  const img = document.getElementById("preview");
  if (img) img.style.display = "none";
}

function zoomImage(src) {
  document.getElementById("modalImg").src = src;
  const modal = new bootstrap.Modal(document.getElementById("imgModal"));
  modal.show();
}
// ================= LOAD =================
async function loadData() {
  try {
    const res = await fetch(API_URL + "?action=get&nama=" + user.nama + "&role=" + user.role);
    const data = await res.json();

    console.log("DATA:", data);

    let html = "";

    data.forEach(d => {

      // ================= FIX URL =================
      let fotoUrl = "";

      if (d.foto) {
        // format /file/d/ID/view
        const match = d.foto.match(/\/d\/(.*?)\//);
        if (match) {
          fotoUrl = "https://drive.google.com/uc?id=" + match[1];
        } 
        // format sudah benar
        else if (d.foto.includes("uc?id=")) {
          fotoUrl = d.foto;
        } 
        // fallback
        else {
          fotoUrl = d.foto;
        }
      }

      html += `
        <div class="card mb-3 shadow-sm">
          <div class="card-body">

            <h6 class="mb-1">${d.pekerjaan || "-"}</h6>
            <small class="text-muted">${d.tanggal || "-"} - ${d.lokasi || "-"}</small>

            <p class="mt-2 mb-1">${d.deskripsi || "-"}</p>

            <span class="badge bg-${d.approval === 'Approved' ? 'primary' : 'warning'}">
              ${d.approval || "Pending"}
            </span>

            ${fotoUrl ? `
              <div class="mt-2">
                <img src="${fotoUrl}"
                     class="img-fluid rounded border"
                     style="max-height:150px; cursor:pointer;"
                     onclick="document.getElementById('modalImg').src='${fotoUrl}'; new bootstrap.Modal(document.getElementById('imgModal')).show();"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=No+Image';">
              </div>
            ` : `
              <div class="text-muted small mt-2">Tidak ada foto</div>
            `}

          </div>
        </div>
      `;
    });

    document.getElementById("listData").innerHTML = html;

  } catch (err) {
    console.error("ERROR LOAD DATA:", err);
    document.getElementById("listData").innerHTML =
      `<div class="alert alert-danger">Gagal load data</div>`;
  }
}

// ================= INIT =================
initApp();
