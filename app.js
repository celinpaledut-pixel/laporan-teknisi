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

// ================= LOAD =================
async function loadData() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const res = await fetch(`${API}?nama=${user.nama}&role=${user.role}`);
  const data = await res.json();

  const el = document.getElementById("list");
  el.innerHTML = "";

  document.getElementById("total").innerText = data.length;
  document.getElementById("selesai").innerText = data.filter(d => d.status === "Selesai").length;
  document.getElementById("pending").innerText = data.filter(d => d.status === "Pending").length;

  data.reverse().forEach(d => {

    const badge = d.approval === "Approved"
      ? `<span class="badge bg-primary">Approved</span>`
      : `<span class="badge bg-secondary">Pending</span>`;

    const actions = d.approval !== "Approved"
      ? `<button class="btn btn-sm btn-warning" onclick='editData(${d.row}, ${JSON.stringify(d)})'>Edit</button>
         <button class="btn btn-sm btn-danger" onclick="hapus(${d.row})">Hapus</button>`
      : "";

    const approveBtn = user.role === "admin" && d.approval !== "Approved"
      ? `<button class="btn btn-sm btn-success" onclick="approve(${d.row})">Approve</button>`
      : "";

    el.innerHTML += `
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">

            <div class="d-flex justify-content-between">
              <b>${d.nama}</b>
              ${badge}
            </div>

            <small>${d.tanggal || "-"}</small>

            <p><b>${d.lokasi}</b> - ${d.pekerjaan}</p>
            <p>${d.deskripsi || "-"}</p>

            ${d.foto ? `<img src="${d.foto}" class="img-fluid rounded mt-2">` : ""}

            <div class="mt-2 d-flex gap-2">
              ${actions}
              ${approveBtn}
            </div>

          </div>
        </div>
      </div>
    `;
  });
}

// ================= INIT =================
initApp();
