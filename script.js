let keranjangBelanja = [];
let produkAktif = {};

// Fungsi membuka form popup pesanan
function bukaForm(button) {
    document.getElementById('modalFormTitle').innerText = "Data Diri Pemesan";
    document.getElementById('btnSubmitText').innerText = "Pesan Sekarang";
    document.getElementById('editIndex').value = ""; // Kosong artinya tambah baru

    produkAktif = {
        nama: button.getAttribute('data-nama'),
        harga: parseInt(button.getAttribute('data-harga'))
    };
    document.getElementById('nama-produk-terpilih').innerText = produkAktif.nama;
    document.getElementById('formModal').style.display = 'block';
}

// Fungsi menutup form popup pesanan
function tutupForm() {
    document.getElementById('formModal').style.display = 'none';
    document.getElementById('orderForm').reset();
}

// Fungsi menyimpan data pesanan (Bisa Tambah Baru atau Update Edit)
function simpanDataPesanan(event) {
    event.preventDefault();
    
    const namaUser = document.getElementById('customerName').value;
    const qty = parseInt(document.getElementById('customerQty').value);
    const ice = document.getElementById('iceLevel').value;
    const sugar = document.getElementById('sugarLevel').value;
    const editIndex = document.getElementById('editIndex').value;
    
    const totalHarga = produkAktif.harga * qty;
    
    if (editIndex === "") {
        // Mode Tambah Baru
        keranjangBelanja.push({
            pemesan: namaUser,
            menu: produkAktif.nama,
            jumlah: qty,
            iceLevel: ice,
            sugarLevel: sugar,
            hargaSatuan: produkAktif.harga,
            total: totalHarga
        });
        alert(`Berhasil memasukkan ke keranjang!`);
    } else {
        // Mode Ubah Pesanan (Update)
        const idx = parseInt(editIndex);
        keranjangBelanja[idx].pemesan = namaUser;
        keranjangBelanja[idx].jumlah = qty;
        keranjangBelanja[idx].iceLevel = ice;
        keranjangBelanja[idx].sugarLevel = sugar;
        keranjangBelanja[idx].total = totalHarga;
        alert(`Pesanan berhasil diperbarui!`);
    }

    perbaruiJumlahKeranjang();
    tutupForm();
    
    // Jika sedang membuka modal keranjang, render ulang tabelnya langsung
    if (document.getElementById('cartModal').style.display === 'block') {
        renderTabelKeranjang();
    }
}

// Update counter angka di icon keranjang belanja melayang
function perbaruiJumlahKeranjang() {
    document.getElementById('cart-count').innerText = keranjangBelanja.length;
}

// Membuka / menutup modal tabel keranjang belanja
function toggleKeranjang() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal.style.display === 'block') {
        cartModal.style.display = 'none';
    } else {
        renderTabelKeranjang();
        cartModal.style.display = 'block';
    }
}

// Menampilkan isi data array ke tabel HTML secara dinamis
function renderTabelKeranjang() {
    const tableBody = document.getElementById('cart-table-body');
    const btnCheckout = document.getElementById('btnCheckout');
    tableBody.innerHTML = ''; 
    
    let grandTotal = 0;

    if (keranjangBelanja.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: #666;">Keranjang belanja Anda masih kosong.</td></tr>';
        if (btnCheckout) {
            btnCheckout.style.disabled = true;
            btnCheckout.style.opacity = "0.5";
            btnCheckout.style.pointerEvents = "none";
        }
    } else {
        if (btnCheckout) {
            btnCheckout.style.disabled = false;
            btnCheckout.style.opacity = "1";
            btnCheckout.style.pointerEvents = "auto";
        }

        keranjangBelanja.forEach((item, index) => {
            grandTotal += item.total;
            const row = `
                <tr>
                    <td><strong>${item.pemesan}</strong></td>
                    <td>${item.menu}</td>
                    <td><small>Ice: ${item.iceLevel} | Sugar: ${item.sugarLevel}</small></td>
                    <td>${item.jumlah}</td>
                    <td>Rp ${item.hargaSatuan.toLocaleString('id-ID')}</td>
                    <td>Rp ${item.total.toLocaleString('id-ID')}</td>
                    <td>
                        <button class="btn-edit" onclick="pemicuUbahPesanan(${index})">Ubah</button>
                        <button class="btn-cancel" onclick="hapusPesanan(${index})">Cancel</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }
    
    const grandTotalElement = document.getElementById('grand-total');
    if (grandTotalElement) {
        grandTotalElement.innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    }
}

// Fitur Cancel (Hapus item)
function hapusPesanan(index) {
    if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
        keranjangBelanja.splice(index, 1);
        perbaruiJumlahKeranjang();
        renderTabelKeranjang();
    }
}

// Fitur Ubah Pesanan (Pindahkan data tabel kembali ke form popup)
function pemicuUbahPesanan(index) {
    const item = keranjangBelanja[index];
    
    document.getElementById('modalFormTitle').innerText = "Ubah Detail Pesanan";
    document.getElementById('btnSubmitText').innerText = "Simpan Perubahan";
    document.getElementById('editIndex').value = index; 
    
    document.getElementById('customerName').value = item.pemesan;
    document.getElementById('customerQty').value = item.jumlah;
    document.getElementById('iceLevel').value = item.iceLevel;
    document.getElementById('sugarLevel').value = item.sugarLevel;
    
    produkAktif = {
        nama: item.menu,
        harga: item.hargaSatuan
    };
    document.getElementById('nama-produk-terpilih').innerText = produkAktif.nama;
    
    document.getElementById('formModal').style.display = 'block';
}

// Fitur Lanjut ke Pembayaran - MENYIMPAN DATA SEBELUM PINDAH
function pindahKePembayaran() {
    if (keranjangBelanja.length === 0) {
        alert("Keranjang belanja Anda masih kosong!");
        return;
    }

    // Format disamakan biar payment.html tinggal pake
    const dataDikirim = keranjangBelanja.map(item => {
        return {
            menu: item.menu,
            qty: item.jumlah, 
            hargaSatuan: item.hargaSatuan,
            totalHarga: item.total,
            customRequest: `Ice: ${item.iceLevel} | Sugar: ${item.sugarLevel}`
        };
    });

    localStorage.setItem('cartData', JSON.stringify(dataDikirim));
    
    let totalSeluruhnya = keranjangBelanja.reduce((sum, item) => sum + item.total, 0);
    localStorage.setItem('grandTotal', `Rp ${totalSeluruhnya.toLocaleString('id-ID')}`);

    // Pindah halaman
    window.location.href = "payment.html";
}

// --- BAGIAN PENTING: PAKSA TOMBOL IKUT ATURAN JS KITA ---
document.addEventListener("DOMContentLoaded", function() {
    const btnCheckout = document.getElementById('btnCheckout');
    if (btnCheckout) {
        // Hapus link href bawaan HTML jika ada agar jalurnya dikontrol penuh oleh JS
        btnCheckout.removeAttribute('href');
        btnCheckout.addEventListener('click', function(e) {
            e.preventDefault();
            pindahKePembayaran();
        });
    }
});

// Menutup modal otomatis kalau user klik area luar modal di layar
window.onclick = function(event) {
    const formModal = document.getElementById('formModal');
    const cartModal = document.getElementById('cartModal');
    if (event.target == formModal) {
        tutupForm();
    }
    if (event.target == cartModal) {
        cartModal.style.display = 'none';
    }
}