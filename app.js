const API = "https://script.google.com/macros/s/AKfycbzZTLMRCOURmqpCUJQ3ilGZTn1iQ1QJN98JbBnkh0ZEolcEpUKQlL0zHvsR5l_x6sf_FA/exec";

function val(id) {
  return document.getElementById(id)?.value || "";
}

// ================= LOGIN =================
function login() {
  const nama = document.getElementById("loginNama").value;

  if (!nama) {
    alert("Isi nama!");
    return;
  }

  localStorage.setItem("teknisi", nama);
  initApp();
}

function logout() {
  localStorage.removeItem("teknisi");
  location.reload();
}

function initApp() {
  const nama = localStorage.getItem("teknisi");

  if (nama) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appBox").style.display = "block";
    document.getElementById("nama").value = nama;

    setTanggalNow();
    loadData();
  }
}

// ================= AUTO TANGGAL =================
function setTanggalNow() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  document.getElementById("tanggal").value = local;
}

// ================= KIRIM =================
function val(id) {
  return document.getElementById(id).value;
}

async function kirim(e) {
  const btn = e.target;
  btn.innerText = "Mengirim...";
  btn.disabled = true;

  const data = {
    nama: val("nama"),
    tanggal: val("tanggal"),
    lokasi: val("lokasi"),
    pekerjaan: val("pekerjaan"),
    deskripsi: val("deskripsi"),
    status: val("status")
  };

  if (!data.nama || !data.tanggal) {
    alert("Data wajib belum lengkap");
    btn.innerText = "🚀 Kirim Laporan";
    btn.disabled = false;
    return;
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data)
    });

    const json = await res.json();

    if (json.status === "success") {
      alert("Berhasil!");
      clearForm();
      loadData();
    } else {
      alert("Error: " + json.message);
    }

  } catch (err) {
    alert("Koneksi gagal");
  }

  btn.innerText = "🚀 Kirim Laporan";
  btn.disabled = false;
}

// ================= CLEAR =================
function clearForm() {
  document.getElementById("lokasi").value = "";
  document.getElementById("pekerjaan").value = "";
  document.getElementById("deskripsi").value = "";
}

// ================= LOAD DATA =================
async function loadData() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    const el = document.getElementById("list");
    el.innerHTML = "";

    data.reverse().forEach(d => {
      el.innerHTML += `
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">

              <div class="d-flex justify-content-between">
                <b>${d.nama}</b>
                <span class="badge ${d.status === 'Selesai' ? 'bg-success' : 'bg-warning'}">
                  ${d.status}
                </span>
              </div>

              <small class="text-muted">${d.tanggal || "-"}</small>

              <p class="mb-1 mt-2"><b>Lokasi:</b> ${d.lokasi || "-"}</p>
              <p class="mb-1"><b>Pekerjaan:</b> ${d.pekerjaan || "-"}</p>

              <p class="mb-0 text-muted">
                <b>Deskripsi:</b> ${d.deskripsi ? d.deskripsi : "<i>Tidak ada deskripsi</i>"}
              </p>

            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}
// INIT
initApp();
loadData();
