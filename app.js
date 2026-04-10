const API_URL = "https://script.google.com/macros/s/AKfycbyd4EC_rPpI0f0aM_sMK4Q-bZ3sREech1P_BPBWXRZ7oZcRRSF2NbHsLn6DA_aWNwmxGA/exec";

let user = {};
let editRow = null;

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
    loginBox.style.display = "none";
    appBox.style.display = "block";

    setTanggal();
    loadData();
  } else {
    alert("Login gagal");
  }
}

// ================= TANGGAL =================
function setTanggal() {
  const now = new Date();
  tanggal.value = now.toLocaleString();
}

// ================= BASE64 =================
function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => res(reader.result);
  });
}

// ================= SIMPAN =================
async function simpan() {
  const file = foto.files[0];
  let base64 = "";

  if (file) base64 = await toBase64(file);

  const action = editRow ? "edit" : "save";

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action,
      row: editRow,
      nama: user.nama,
      tanggal: tanggal.value,
      lokasi: lokasi.value,
      pekerjaan: pekerjaan.value,
      deskripsi: deskripsi.value,
      status: status.value,
      foto: base64
    })
  });

  editRow = null;
  loadData();
}

// ================= LOAD =================
async function loadData() {
  const res = await fetch(API_URL + "?nama=" + user.nama + "&role=" + user.role);
  const data = await res.json();

  let html = "";

  data.forEach(d => {
    html += `
    <div class="card mb-3">
      <div class="card-body">

        <h6>${d.pekerjaan}</h6>
        <small>${d.nama} | ${d.tanggal}</small>

        <p>${d.deskripsi}</p>

        <span class="badge bg-info">${d.status}</span>
        <span class="badge bg-${d.approval === 'Approved' ? 'primary' : 'warning'}">
          ${d.approval}
        </span>

        ${d.foto ? `
        <img src="${d.foto}" class="img-fluid mt-2"
             style="max-height:150px; cursor:pointer;"
             onclick="showImg('${d.foto}')">
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

  listData.innerHTML = html;
}

// ================= EDIT =================
function editData(row, t, l, p, d, s) {
  editRow = row;
  tanggal.value = t;
  lokasi.value = l;
  pekerjaan.value = p;
  deskripsi.value = d;
  status.value = s;
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

// ================= ZOOM =================
function showImg(src) {
  modalImg.src = src;
  new bootstrap.Modal(imgModal).show();
}
