const API = "PASTE_URL_WEB_APP_KAMU";

async function kirim() {
  const data = {
    nama: val("nama"),
    tanggal: val("tanggal"),
    lokasi: val("lokasi"),
    pekerjaan: val("pekerjaan"),
    deskripsi: val("deskripsi"),
    status: val("status")
  };

  if (!data.nama || !data.tanggal) {
    alert("Nama & tanggal wajib!");
    return;
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const json = await res.json();

    if (json.status === "success") {
      alert("Berhasil kirim!");
      loadData();
      clearForm();
    } else {
      alert("Error: " + json.message);
    }

  } catch (err) {
    alert("Koneksi error");
  }
}

function val(id) {
  return document.getElementById(id).value;
}

function clearForm() {
  ["tanggal","lokasi","pekerjaan","deskripsi"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

async function loadData() {
  const res = await fetch(API);
  const data = await res.json();

  const el = document.getElementById("list");
  el.innerHTML = "";

  data.reverse().forEach(d => {
    el.innerHTML += `
      <div class="card">
        <b>${d.nama}</b><br>
        ${d.tanggal}<br>
        ${d.lokasi}<br>
        ${d.pekerjaan}<br>
        <small>${d.status}</small>
      </div>
    `;
  });
}

loadData();
