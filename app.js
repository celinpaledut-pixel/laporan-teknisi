const API_URL = "https://script.google.com/macros/s/AKfycbxCQKkG0islQNowrIA5TNiZQkN9qAXmLTBGjg26tFpuewjvwdAD1eH4JyCsHxzcD1A1JQ/exec";

let user = {};
let editRow = null;
let fotoBase64 = "";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const fotoInput = document.getElementById("foto");

  if (fotoInput) {
    fotoInput.addEventListener("change", async function () {
      const file = this.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("File harus gambar");
        this.value = "";
        return;
      }

      fotoBase64 = await toBase64(file);
      console.log("FOTO READY:", fotoBase64.length);

      const preview = document.getElementById("previewImg");
      if (preview) {
        preview.src = fotoBase64;
        preview.style.display = "block";
      }
    });
  }
});

// ================= LOGIN =================
async function login() {
  const nama = document.getElementById("nama").value;
  const pin = document.getElementById("pin").value;

  if (!nama || !pin) {
    alert("Isi nama & PIN");
    return;
  }

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
  fotoBase64 = "";

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
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

// ================= SIMPAN =================
async function simpan() {
  try {
    if (!user.nama) {
      alert("Harus login dulu");
      return;
    }

    const action = editRow ? "edit" : "save";

    if (action === "save" && (!fotoBase64 || fotoBase64.length < 1000)) {
      alert("Foto wajib diisi!");
      return;
    }

    console.log("KIRIM FOTO:", fotoBase64.length);

    const payload = {
      action,
      row: editRow,
      nama: user.nama,
      tanggal: document.getElementById("tanggal").value,
      lokasi: document.getElementById("lokasi").value,
      pekerjaan: document.getElementById("pekerjaan").value,
      deskripsi: document.getElementById("deskripsi").value,
      status: document.getElementById("status").value,
      foto: fotoBase64
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    console.log("RESP:", result);

    resetForm();
    loadData();

  } catch (err) {
    console.error(err);
    alert("Gagal simpan");
  }
}
// ================= RESET =================
function resetForm() {
  editRow = null;
  fotoBase64 = "";

  document.getElementById("foto").value = "";

  const preview = document.getElementById("previewImg");
  if (preview) {
    preview.style.display = "none";
    preview.src = "";
  }

  document.getElementById("lokasi").value = "";
  document.getElementById("pekerjaan").value = "";
  document.getElementById("deskripsi").value = "";
  document.getElementById("status").value = "";

  setTanggal();
}

// ================= LOAD DATA =================
async function loadData() {
  if (!user.nama) return;

  const res = await fetch(API_URL + "?nama=" + user.nama + "&role=" + user.role);
  const data = await res.json();

  let html = "";

  if (!data.length) {
    html = `<div class="alert alert-warning">Belum ada laporan</div>`;
  }

  const safe = (t) => (t || "").toString().replace(/'/g, "");

  data.forEach(d => {
    html += `
    <div class="card mb-3 ${d.approval === 'Approved' ? 'border-primary' : ''}">
      <div class="card-body">

        <h6>${safe(d.pekerjaan)}</h6>

        <small><b>${safe(d.nama)}</b> | ${safe(d.tanggal)} | ${safe(d.lokasi)}</small>

        <p>${safe(d.deskripsi)}</p>

        <span class="badge bg-info">${safe(d.status)}</span>
        <span class="badge bg-${d.approval === 'Approved' ? 'primary' : 'warning'}">
          ${safe(d.approval)}
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
            <button onclick="editData(${d.row}, '${safe(d.tanggal)}', '${safe(d.lokasi)}', '${safe(d.pekerjaan)}', '${safe(d.deskripsi)}', '${safe(d.status)}')"
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
  if (!confirm("Hapus data ini?")) return;

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
