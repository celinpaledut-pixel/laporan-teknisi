const API = "https://script.google.com/macros/s/AKfycbzPsz-7ZJ93OIEwZkyWvqwmomHXH_wPiAi_rwSNjo1JwqSBzdCG_6Jb1k6oCNtXMBGOSg/exec";

// ================= STATE =================
let fotoBase64 = "";
let editMode = false;
let editRow = null;

// ================= FOTO =================
function previewFoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(evt) {
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

  if (!nama || !pin) {
    alert("Isi semua!");
    return;
  }

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

  } catch (err) {
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

  const roleEl = document.getElementById("roleBadge");
  if (roleEl) roleEl.innerText = user.role;

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

// ================= KIRIM =================
async function kirim(e) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Login dulu");

  if (!fotoBase64) return alert("Foto wajib");

  const data = {
    action: "save",
    nama: user.nama,
    tanggal: val("tanggal"),
    lokasi: val("lokasi"),
    pekerjaan: val("pekerjaan"),
    deskripsi: val("deskripsi"),
    status: val("status"),
    foto: fotoBase64
  };

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data)
  });

  alert("Berhasil");
  clearForm();
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

// ================= ACTION =================
async function approve(row) {
  if (!confirm("Approve laporan?")) return;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "approve", row })
  });

  loadData();
}

function editData(row, data) {
  editMode = true;
  editRow = row;

  // isi form
  document.getElementById("tanggal").value = data.tanggal;
  document.getElementById("lokasi").value = data.lokasi;
  document.getElementById("pekerjaan").value = data.pekerjaan;
  document.getElementById("deskripsi").value = data.deskripsi;
  document.getElementById("status").value = data.status;

  // tombol berubah
  document.getElementById("btnSubmit").innerText = "💾 Update Laporan";
  document.getElementById("btnCancel").style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function updateData() {
  const user = JSON.parse(localStorage.getItem("user"));

  const data = {
    action: "edit",
    row: editRow,
    tanggal: val("tanggal"),
    lokasi: val("lokasi"),
    pekerjaan: val("pekerjaan"),
    deskripsi: val("deskripsi"),
    status: val("status")
  };

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data)
  });

  alert("Data berhasil diupdate");

  batalEdit();
  loadData();
}

function batalEdit() {
  editMode = false;
  editRow = null;

  document.getElementById("btnSubmit").innerText = "🚀 Kirim Laporan";
  document.getElementById("btnCancel").style.display = "none";

  clearForm();
}
async function hapus(row) {
  if (!confirm("Hapus laporan?")) return;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "delete", row })
  });

  loadData();
}

async function editData(row) {
  const lokasi = prompt("Lokasi baru:");
  if (!lokasi) return;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      action: "edit",
      row,
      tanggal: val("tanggal"),
      lokasi,
      pekerjaan: val("pekerjaan"),
      deskripsi: val("deskripsi"),
      status: val("status")
    })
  });

  loadData();
}

// ================= LOAD DATA =================
async function loadData() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const res = await fetch(`${API}?nama=${user.nama}&role=${user.role}`);
  const data = await res.json();

  const el = document.getElementById("list");
  el.innerHTML = "";

  // DASHBOARD
  document.getElementById("total").innerText = data.length;
  document.getElementById("selesai").innerText = data.filter(d => d.status === "Selesai").length;
  document.getElementById("pending").innerText = data.filter(d => d.status === "Pending").length;

  data.reverse().forEach(d => {

    const badgeApproval = d.approval === "Approved"
      ? `<span class="badge bg-primary">Approved</span>`
      : `<span class="badge bg-secondary">Pending</span>`;

    const actionButtons = d.approval !== "Approved"
      ? `
        <button class="btn btn-sm btn-warning" onclick="editData(${d.row})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="hapus(${d.row})">Hapus</button>
      `
      : "";

    const adminButton = user.role === "admin" && d.approval !== "Approved"
      ? `<button class="btn btn-sm btn-success" onclick="approve(${d.row})">Approve</button>`
      : "";

    el.innerHTML += `
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">

            <div class="d-flex justify-content-between">
              <b>${d.nama}</b>
              ${badgeApproval}
            </div>

            <small>${d.tanggal || "-"}</small>

            <p class="mb-1"><b>${d.lokasi}</b> - ${d.pekerjaan}</p>
            <p>${d.deskripsi || "-"}</p>

            ${d.foto ? `<img src="${d.foto}" class="img-fluid rounded mt-2">` : ""}

            <div class="mt-2 d-flex gap-2">
              ${actionButtons}
              ${adminButton}
            </div>

          </div>
        </div>
      </div>
    `;
  });
}

// ================= INIT =================
initApp();
