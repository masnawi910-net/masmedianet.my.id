import { DISTRICT_VILLAGES_OFFLINE } from '../services/indonesiaRegionService';

// Data Wilayah Administratif Indonesia (Provinsi, Kota/Kabupaten, Kecamatan, Desa/Kelurahan)

export interface Village {
  name: string;
  postalCode?: string;
}

export interface District {
  name: string;
  villages: string[];
}

export interface RegencyCity {
  name: string;
  type: 'Kota' | 'Kabupaten';
  districts: District[];
}

export interface Province {
  id: string;
  name: string;
  cities: RegencyCity[];
}

export const INDONESIA_REGIONS: Province[] = [
  {
    id: 'JB',
    name: 'Jawa Barat',
    cities: [
      {
        name: 'Kota Bandung',
        type: 'Kota',
        districts: [
          { name: 'Coblong', villages: ['Dago', 'Lebak Siliwangi', 'Lebakgede', 'Sadang Serang', 'Sekeloa'] },
          { name: 'Sukasari', villages: ['Geger Kalong', 'Isola', 'Sarijadi', 'Sukarasa'] },
          { name: 'Cicendo', villages: ['Arjuna', 'Husen Sastranegara', 'Pajajaran', 'Pamoyanan', 'Pasirkaliki', 'Sukamaju'] },
          { name: 'Sumur Bandung', villages: ['Babakan Ciamis', 'Braga', 'Kebon Pisang', 'Merdeka'] },
          { name: 'Lengkong', villages: ['Burangrang', 'Cijagra', 'Cikawao', 'Lingkar Selatan', 'Malabar', 'Paledang', 'Turangga'] },
          { name: 'Buahbatu', villages: ['Cijawura', 'Jatisari', 'Margasari', 'Sekejati'] },
          { name: 'Bandung Wetan', villages: ['Cihapit', 'Citarum', 'Tamansari'] },
          { name: 'Andir', villages: ['Campaka', 'Ciroyom', 'Dunguscariang', 'Garuda', 'Kebon Jeruk', 'Maleber'] },
        ]
      },
      {
        name: 'Kabupaten Bandung',
        type: 'Kabupaten',
        districts: [
          { name: 'Soreang', villages: ['Soreang', 'Panyirapan', 'Sekarwangi', 'Sadu', 'Cingcin', 'Karamatmulya'] },
          { name: 'Banjaran', villages: ['Banjaran', 'Banjaran Wetan', 'Ciapus', 'Kamasan', 'Kiangroke', 'Margahurip', 'Pasirmulya', 'Sindangpanon', 'Tarajusari'] },
          { name: 'Baleendah', villages: ['Andir', 'Baleendah', 'Bojongmalaka', 'Jelekong', 'Malakasari', 'Manggahang', 'Rancamanyar', 'Wargamekar'] },
          { name: 'Dayeuhkolot', villages: ['Cangkuang Kulon', 'Cangkuang Wetan', 'Citeureup', 'Dayeuhkolot', 'Pasawahan', 'Sukapura'] },
          { name: 'Margahayu', villages: ['Margahayu Selatan', 'Margahayu Tengah', 'Sayati', 'Sukamenak', 'Sulaeman'] },
        ]
      },
      {
        name: 'Kota Bekasi',
        type: 'Kota',
        districts: [
          { name: 'Bekasi Timur', villages: ['Aren Jaya', 'Bekasi Jaya', 'Duren Jaya', 'Margahayu'] },
          { name: 'Bekasi Barat', villages: ['Bintara', 'Bintara Jaya', 'Jaka Sampurna', 'Kota Baru', 'Kranji'] },
          { name: 'Bekasi Selatan', villages: ['Jaka Mulya', 'Jaka Setia', 'Kayuringin Jaya', 'Mekar Jaya', 'Pekayon Jaya'] },
          { name: 'Bekasi Utara', villages: ['Harapan Baru', 'Harapan Jaya', 'Kaliabang Tengah', 'Marga Mulya', 'Perwira', 'Teluk Pucung'] },
        ]
      },
      {
        name: 'Kabupaten Bekasi',
        type: 'Kabupaten',
        districts: [
          { name: 'Cikarang Pusat', villages: ['Cicau', 'Hegarmukti', 'Jayamukti', 'Pasirranji', 'Pasirtanjung', 'Sukamahi'] },
          { name: 'Cikarang Barat', villages: ['Cikedokan', 'Danau Indah', 'Gandamekar', 'Gandasari', 'Jatiwangi', 'Kalijaya', 'Mekarwangi', 'Sukadanau', 'Telaga Asih', 'Telagamurni', 'Telajung'] },
          { name: 'Cikarang Utara', villages: ['Cikarangkota', 'Harjamekar', 'Karangasih', 'Karangbaru', 'Karangraharja', 'Mekarmukti', 'Pasirgombong', 'Simpangan', 'Tanjungsari', 'Waluya', 'Wangunharja'] },
          { name: 'Cikarang Selatan', villages: ['Ciantra', 'Cibatu', 'Pasirsari', 'Serang', 'Sukadami', 'Sukaresmi', 'Sukasejati'] },
          { name: 'Tambun Selatan', villages: ['Jatimulya', 'Lambangjaya', 'Lambangsari', 'Mangunjaya', 'Setiadarma', 'Setiamekar', 'Sumberjaya', 'Tambun', 'Tridaya Sakti'] },
        ]
      },
      {
        name: 'Kota Bogor',
        type: 'Kota',
        districts: [
          { name: 'Bogor Tengah', villages: ['Babakan', 'Babakan Pasar', 'Cibogor', 'Ciwaringin', 'Gudang', 'Kebon Kelapa', 'Pabaton', 'Paledang', 'Panaragan', 'Sempur', 'Tegallega'] },
          { name: 'Bogor Selatan', villages: ['Batutulis', 'Bojongkerta', 'Bondongan', 'Cikaret', 'Cipaku', 'Empang', 'Genteng', 'Harjasari', 'Kertamaya', 'Lawanggintung', 'Muarasari', 'Mulyaharja', 'Pakuan', 'Pamoyanan', 'Rancamaya', 'Ranggamekar'] },
          { name: 'Bogor Utara', villages: ['Bantarjati', 'Cibuluh', 'Ciluar', 'Cimahpar', 'Ciparigi', 'Kedunghalang', 'Tanah Baru', 'Tegal Gundil'] },
          { name: 'Bogor Timur', villages: ['Baranangsiang', 'Katulampa', 'Sindangrasa', 'Sindangbarang', 'Sukasari', 'Tajur'] },
        ]
      },
      {
        name: 'Kabupaten Bogor',
        type: 'Kabupaten',
        districts: [
          { name: 'Cibinong', villages: ['Cibinong', 'Cirimekar', 'Ciriung', 'Harapan Jaya', 'Karadenan', 'Nanggewer', 'Nanggewer Mekar', 'Pabuaran', 'Pabuaran Mekar', 'Pakansari', 'Pondok Rajeg', 'Sukahati', 'Tengah'] },
          { name: 'Citeureup', villages: ['Citeureup', 'Gunung Sari', 'Hambalang', 'Karang Asem Barat', 'Karang Asem Timur', 'Leuwinutug', 'Pasir Mukti', 'Puspanegara', 'Puspasari', 'Sanja', 'Sukahati', 'Tajur', 'Tangkil'] },
          { name: 'Babakan Madang', villages: ['Babakan Madang', 'Bojong Koneng', 'Cadas Ngampar', 'Cijayanti', 'Cipambuan', 'Citaringgul', 'Kadumangu', 'Karang Tengah', 'Sentul', 'Sumur Batu'] },
          { name: 'Ciawi', villages: ['Banjar Sari', 'Banjar Wangi', 'Bitung Sari', 'Bojong Murni', 'Ciawi', 'Cibedug', 'Cileungsi', 'Citapen', 'Jambu Luwuk', 'Pandansari', 'Teluk Pinang'] },
        ]
      },
      {
        name: 'Kota Depok',
        type: 'Kota',
        districts: [
          { name: 'Pancoran Mas', villages: ['Depok', 'Depok Jaya', 'Mampang', 'Pancoran Mas', 'Rangkapan Jaya', 'Rangkapan Jaya Baru'] },
          { name: 'Sukmajaya', villages: ['Abadijaya', 'Bakti Jaya', 'Cisalak', 'Mekar Jaya', 'Sukmajaya', 'Tirtajaya'] },
          { name: 'Beji', villages: ['Beji', 'Beji Timur', 'Kemirimuka', 'Kukusan', 'Pondok Cina', 'Tanah Baru'] },
          { name: 'Cimanggis', villages: ['Curug', 'Harjamukti', 'Mekarsari', 'Pasir Gunung Selatan', 'Tugu'] },
          { name: 'Cinere', villages: ['Cinere', 'Gandul', 'Pangkalan Jati', 'Pangkalan Jati Baru'] },
        ]
      },
      {
        name: 'Kabupaten Karawang',
        type: 'Kabupaten',
        districts: [
          { name: 'Karawang Barat', villages: ['Adiarsa Barat', 'Karangpawitan', 'Karawang Kulon', 'Mekarjati', 'Nagreg', 'Tanjungmekar', 'Tanjungpura', 'Tunggakjati'] },
          { name: 'Karawang Timur', villages: ['Adiarsa Timur', 'Klari', 'Kondangjaya', 'Palumbonsari', 'Plawad', 'Tegalsawah', 'Varita'] },
          { name: 'Telukjambe Timur', villages: ['Pinayungan', 'Puseurjaya', 'Sirnabaya', 'Sukaharja', 'Sukaluyu', 'Telukjambe', 'Wadas'] },
          { name: 'Klari', villages: ['Anggadita', 'Belendung', 'Cibalongsari', 'Cimahi', 'Curug', 'Duren', 'Gintungkerta', 'Kancana', 'Karanganyar', 'Klari', 'Pancawati', 'Sumurkondang', 'Walahar'] },
        ]
      },
      {
        name: 'Kota Cirebon',
        type: 'Kota',
        districts: [
          { name: 'Kejaksan', villages: ['Kebonbaru', 'Kejaksan', 'Kesenden', 'Sukapura'] },
          { name: 'Kesambi', villages: ['Drajat', 'Karyamulya', 'Kesambi', 'Pekiringan', 'Sunyaragi'] },
          { name: 'Lemahwungkuk', villages: ['Kasepuhan', 'Lemahwungkuk', 'Panjunan', 'Pegambiran'] },
        ]
      },
      {
        name: 'Kabupaten Cirebon',
        type: 'Kabupaten',
        districts: [
          { name: 'Sumber', villages: ['Gegunung', 'Kemantren', 'Matangaji', 'Pasirapan', 'Pejambon', 'Perbutulan', 'Sendang', 'Sidawangi', 'Sumber', 'Tukmudal', 'Watubelah'] },
          { name: 'Kedawung', villages: ['Kedawung', 'Kalikoa', 'Kertawinangun', 'Pilangsari', 'Sutawinangun', 'Tuk'] },
          { name: 'Weru', villages: ['Karangsari', 'Kertawinangun', 'Megu Cilik', 'Megu Gede', 'Setu Kulon', 'Setu Patok', 'Tegalwangi', 'Weru Kidul', 'Weru Lor'] },
        ]
      },
    ]
  },
  {
    id: 'DKI',
    name: 'DKI Jakarta',
    cities: [
      {
        name: 'Jakarta Selatan',
        type: 'Kota',
        districts: [
          { name: 'Kebayoran Baru', villages: ['Cipete Utara', 'Gandaria Utara', 'Gunung', 'Kramat Pela', 'Melawai', 'Petogogan', 'Pulo', 'Rawa Barat', 'Selong', 'Senayan'] },
          { name: 'Kebayoran Lama', villages: ['Cipulir', 'Grogol Selatan', 'Grogol Utara', 'Kebayoran Lama Selatan', 'Kebayoran Lama Utara', 'Pondok Pinang'] },
          { name: 'Cilandak', villages: ['Cilandak Barat', 'Cipete Selatan', 'Gandaria Selatan', 'Lebak Bulus', 'Pondok Labu'] },
          { name: 'Pasar Minggu', villages: ['Cilandak Timur', 'Jati Padang', 'Kebagusan', 'Pasar Minggu', 'Pejaten Barat', 'Pejaten Timur', 'Ragunan'] },
          { name: 'Tebet', villages: ['Bukit Duri', 'Kebon Baru', 'Manggarai', 'Manggarai Selatan', 'Menteng Dalam', 'Tebet Barat', 'Tebet Timur'] },
          { name: 'Setiabudi', villages: ['Guntur', 'Karet', 'Karet Kuningan', 'Karet Semanggi', 'Kuningan Timur', 'Menteng Atas', 'Pasar Manggis', 'Setiabudi'] },
          { name: 'Mampang Prapatan', villages: ['Bangka', 'Kuningan Barat', 'Mampang Prapatan', 'Pela Mampang', 'Tegal Parang'] },
          { name: 'Pancoran', villages: ['Cikoko', 'Duren Tiga', 'Kalibata', 'Pancoran', 'Pengadegan', 'Rawajati'] },
          { name: 'Jagakarsa', villages: ['Ciganjur', 'Cipedak', 'Jagakarsa', 'Lenteng Agung', 'Srengseng Sawah', 'Tanjung Barat'] },
          { name: 'Pesanggrahan', villages: ['Bintaro', 'Pesanggrahan', 'Petukangan Selatan', 'Petukangan Utara', 'Ulujami'] },
        ]
      },
      {
        name: 'Jakarta Pusat',
        type: 'Kota',
        districts: [
          { name: 'Menteng', villages: ['Cikini', 'Gondangdia', 'Kebon Sirih', 'Menteng', 'Pegangsaan'] },
          { name: 'Gambir', villages: ['Cideng', 'Duri Pulo', 'Gambir', 'Kebon Kelapa', 'Petojo Selatan', 'Petojo Utara'] },
          { name: 'Tanah Abang', villages: ['Bendungan Hilir', 'Gelora', 'Kampung Bali', 'Karet Tengsin', 'Kebon Kacang', 'Kebon Melati', 'Petamburan'] },
          { name: 'Senen', villages: ['Bungur', 'Kenari', 'Kramat', 'Kwitang', 'Paseban', 'Senen'] },
          { name: 'Cempaka Putih', villages: ['Cempaka Putih Barat', 'Cempaka Putih Timur', 'Rawasari'] },
          { name: 'Kemayoran', villages: ['Cempaka Baru', 'Gunung Sahari Selatan', 'Harapan Mulya', 'Kebon Kosong', 'Kemayoran', 'Serdang', 'Sumur Batu', 'Utan Panjang'] },
          { name: 'Sawah Besar', villages: ['Gunung Sahari Utara', 'Karang Anyar', 'Kartini', 'Mangga Dua Selatan', 'Pasar Baru'] },
          { name: 'Johar Baru', villages: ['Galur', 'Johar Baru', 'Kampung Rawa', 'Tanah Tinggi'] },
        ]
      },
      {
        name: 'Jakarta Barat',
        type: 'Kota',
        districts: [
          { name: 'Grogol Petamburan', villages: ['Grogol', 'Jelambar', 'Jelambar Baru', 'Tanjung Duren Selatan', 'Tanjung Duren Utara', 'Tomang', 'Wijaya Kusuma'] },
          { name: 'Kebon Jeruk', villages: ['Duri Kepa', 'Kedoya Selatan', 'Kedoya Utara', 'Kebon Jeruk', 'Kelapa Dua', 'Sukabumi Selatan', 'Sukabumi Utara'] },
          { name: 'Kembangan', villages: ['Joglo', 'Kembangan Selatan', 'Kembangan Utara', 'Meruya Selatan', 'Meruya Utara', 'Srengseng'] },
          { name: 'Palmerah', villages: ['Jatipulo', 'Kemanggisan', 'Kota Bambu Selatan', 'Kota Bambu Utara', 'Palmerah', 'Slipi'] },
          { name: 'Cengkareng', villages: ['Cengkareng Barat', 'Cengkareng Timur', 'Duri Kosambi', 'Kapuk', 'Kedaung Kali Angke', 'Rawa Buaya'] },
          { name: 'Kalideres', villages: ['Kalideres', 'Kamal', 'Pegadungan', 'Semanan', 'Tegal Alur'] },
          { name: 'Tambora', villages: ['Angke', 'Duri Selatan', 'Duri Utara', 'Jembatan Besi', 'Jembatan Lima', 'Kali Anyar', 'Krendang', 'Pekojan', 'Roa Malaka', 'Tambora', 'Tanah Sereal'] },
          { name: 'Taman Sari', villages: ['Glodok', 'Keagungan', 'Krukut', 'Mangga Besar', 'Maphar', 'Pinangsia', 'Taman Sari', 'Tangki'] },
        ]
      },
      {
        name: 'Jakarta Timur',
        type: 'Kota',
        districts: [
          { name: 'Matraman', villages: ['Kayu Manis', 'Kebon Manggis', 'Pal Meriam', 'Pisangan Baru', 'Utan Kayu Selatan', 'Utan Kayu Utara'] },
          { name: 'Pulo Gadung', villages: ['Cipinang', 'Jati', 'Jatinegara Kaum', 'Kayu Putih', 'Pisangan Timur', 'Pulo Gadung', 'Rawamangun'] },
          { name: 'Jatinegara', villages: ['Bali Mester', 'Bidara Cina', 'Cipinang Besar Selatan', 'Cipinang Besar Utara', 'Cipinang Cempedak', 'Cipinang Muara', 'Kampung Melayu', 'Rawa Bunga'] },
          { name: 'Duren Sawit', villages: ['Duren Sawit', 'Klender', 'Malaka Jaya', 'Malaka Sari', 'Pondok Bambu', 'Pondok Kelapa', 'Pondok Kopi'] },
          { name: 'Kramat Jati', villages: ['Balekambang', 'Batu Ampar', 'Cawang', 'Cililitan', 'Dukuh', 'Kramat Jati', 'Tengah'] },
          { name: 'Pasar Rebo', villages: ['Baru', 'Cijantung', 'Gedong', 'Kalisari', 'Pekayon'] },
          { name: 'Ciracas', villages: ['Cibubur', 'Ciracas', 'Kelapa Dua Wetan', 'Rambutan', 'Susukan'] },
          { name: 'Cipayung', villages: ['Bambu Apus', 'Ceger', 'Cilangkap', 'Cipayung', 'Lubang Buaya', 'Munjul', 'Pondok Ranggon', 'Setu'] },
          { name: 'Cakung', villages: ['Cakung Barat', 'Cakung Timur', 'Jatinegara', 'Penggilingan', 'Pulo Gebang', 'Rawa Terate', 'Ujung Menteng'] },
        ]
      },
      {
        name: 'Jakarta Utara',
        type: 'Kota',
        districts: [
          { name: 'Penjaringan', villages: ['Kamal Muara', 'Kapuk Muara', 'Pejagalan', 'Penjaringan', 'Pluit'] },
          { name: 'Tanjung Priok', villages: ['Kebon Bawang', 'Papanggo', 'Sungai Bambu', 'Sunter Agung', 'Sunter Jaya', 'Tanjung Priok', 'Warakas'] },
          { name: 'Kelapa Gading', villages: ['Kelapa Gading Barat', 'Kelapa Gading Timur', 'Pegangsaan Dua'] },
          { name: 'Pademangan', villages: ['Ancol', 'Pademangan Barat', 'Pademangan Timur'] },
          { name: 'Koja', villages: ['Koja', 'Lagoa', 'Rawa Badak Selatan', 'Rawa Badak Utara', 'Tugu Selatan', 'Tugu Utara'] },
          { name: 'Cilincing', villages: ['Cilincing', 'Kalibaru', 'Marunda', 'Rorotan', 'Semper Barat', 'Semper Timur', 'Sukapura'] },
        ]
      },
      {
        name: 'Kepulauan Seribu',
        type: 'Kabupaten',
        districts: [
          { name: 'Kepulauan Seribu Selatan', villages: ['Pulau Pari', 'Pulau Tidung', 'Pulau Untung Jawa'] },
          { name: 'Kepulauan Seribu Utara', villages: ['Pulau Harapan', 'Pulau Kelapa', 'Pulau Panggang'] },
        ]
      }
    ]
  },
  {
    id: 'JT',
    name: 'Jawa Tengah',
    cities: [
      {
        name: 'Kota Semarang',
        type: 'Kota',
        districts: [
          { name: 'Semarang Tengah', villages: ['Bangunharjo', 'Brumbungan', 'Gabahan', 'Jagalan', 'Karangkidul', 'Kauman', 'Kembangsari', 'Kranggan', 'Miroto', 'Pandansari', 'Pekunden', 'Pendrikan Kidul', 'Pendrikan Lor', 'Purwodinatan', 'Sekayu'] },
          { name: 'Semarang Barat', villages: ['Bojongsalaman', 'Bongsari', 'Cabean', 'Gisikdrono', 'Kalibanteng Kidul', 'Kalibanteng Kulon', 'Karangayu', 'Kembangarum', 'Krapyak', 'Krobokan', 'Manyaran', 'Ngemplak Simongan', 'Salamanmloyo', 'Tambakharjo', 'Tawangmas', 'Tawangsari'] },
          { name: 'Semarang Selatan', villages: ['Barusari', 'Bulustalan', 'Lamper Kidul', 'Lamper Lor', 'Lamper Tengah', 'Mugassari', 'Peterongan', 'Pleburan', 'Randusari', 'Wonodri'] },
          { name: 'Banyumanik', villages: ['Banyumanik', 'Gedawang', 'Jabungan', 'Pudakpayung', 'Padangsari', 'Pedurungan', 'Sumurboto', 'Srondol Kulon', 'Srondol Wetan', 'Tinjomoyo'] },
          { name: 'Pedurungan', villages: ['Gemah', 'Kalisegoro', 'Muktiharjo Kidul', 'Palebon', 'Pedurungan Kidul', 'Pedurungan Lor', 'Pedurungan Tengah', 'Penggaron Kidul', 'Plamongan Sari', 'Tlogomulyo', 'Tlogosari Kulon', 'Tlogosari Wetan'] },
        ]
      },
      {
        name: 'Kota Surakarta (Solo)',
        type: 'Kota',
        districts: [
          { name: 'Banjarsari', villages: ['Banyuanyar', 'Banjarsari', 'Gilingan', 'Kadipiro', 'Keprabon', 'Kestalan', 'Ketelan', 'Manahan', 'Mangkubumen', 'Nusukan', 'Punggawan', 'Setabelan', 'Sumber', 'Timuran'] },
          { name: 'Laweyan', villages: ['Bumi', 'Jajar', 'Karangasem', 'Kerten', 'Laweyan', 'Pajang', 'Panularan', 'Penumping', 'Purwosari', 'Sondakan', 'Sriwedari'] },
          { name: 'Jebres', villages: ['Gandekan', 'Jagalan', 'Jebres', 'Kepatihan Kulon', 'Kepatihan Wetan', 'Mojosongo', 'Pucangsawit', 'Purwodiningratan', 'Sewu', 'Sudiroprajan', 'Tegalharjo'] },
          { name: 'Pasar Kliwon', villages: ['Baluwarti', 'Gajahan', 'Joyosuran', 'Kampung Baru', 'Kauman', 'Kedung Lumbu', 'Pasar Kliwon', 'Semanggi', 'Mojo'] },
          { name: 'Serengan', villages: ['Danukusuman', 'Jayengan', 'Joyotakan', 'Kemlayan', 'Kratonan', 'Serengan', 'Tipes'] },
        ]
      },
      {
        name: 'Kabupaten Banyumas (Purwokerto)',
        type: 'Kabupaten',
        districts: [
          { name: 'Purwokerto Timur', villages: ['Arcawinangun', 'Kranji', 'Mersi', 'Purwokerto Lor', 'Purwokerto Wetan', 'Sokanegara'] },
          { name: 'Purwokerto Barat', villages: ['Bantarsoka', 'Karanglewas Lor', 'Kedungwuluh', 'Kober', 'Pasirmuncang', 'Pasir Kidul', 'Rejasari'] },
          { name: 'Purwokerto Selatan', villages: ['Berkoh', 'Karangklesem', 'Karangpucung', 'Purwokerto Kulon', 'Purwokerto Selatan', 'Tanjung', 'Teluk'] },
          { name: 'Purwokerto Utara', villages: ['Bancarkembar', 'Bobosan', 'Grendeng', 'Karangwangkal', 'Pabuaran', 'Purwanegara', 'Sumampir'] },
          { name: 'Baturraden', villages: ['Karangmangu', 'Karangtengah', 'Kebumen', 'Kemutug Kidul', 'Kemutug Lor', 'Ketenger', 'Kutasari', 'Pandak', 'Purwosari', 'Rempoah'] },
        ]
      },
      {
        name: 'Kabupaten Cilacap',
        type: 'Kabupaten',
        districts: [
          { name: 'Cilacap Tengah', villages: ['Donan', 'Gunungsimping', 'Kutawaru', 'Lomanis', 'Sidanegara'] },
          { name: 'Cilacap Selatan', villages: ['Cilacap', 'Sidakaya', 'Tambakreja', 'Tegalkamulyan'] },
          { name: 'Cilacap Utara', villages: ['Gumilir', 'Karangtalun', 'Kebonmanis', 'Mertasinga', 'Tritih Kulon'] },
          { name: 'Kroya', villages: ['Ayamalas', 'Bajing', 'Bajing Kulon', 'Buntu', 'Gentawangi', 'Karangmangu', 'Karangturi', 'Kedawung', 'Kroya', 'Mernek', 'Mekar Sari', 'Mujur', 'Mujur Lor', 'Pekuncen', 'Pesanggrahan', 'Pucung Kidul', 'Pucung Lor', 'Sikampuh'] },
        ]
      },
      {
        name: 'Kabupaten Magelang',
        type: 'Kabupaten',
        districts: [
          { name: 'Mertoyudan', villages: ['Banjarnegoro', 'Banyurojo', 'Bondowoso', 'Bulurejo', 'Danurejo', 'Deyangan', 'Jogonegoro', 'Kalinegoro', 'Mertoyudan', 'Pasuruhan', 'Sukorejo', 'Sumberrejo'] },
          { name: 'Borobudur', villages: ['Borobudur', 'Bumiharjo', 'Candirejo', 'Girimulyo', 'Giritengah', 'Karanganyar', 'Karangrejo', 'Kebonsari', 'Kembanglimus', 'Kenalan', 'Majaksingi', 'Ngadiharjo', 'Ngargogondo', 'Sambeng', 'Tanjungsari', 'Tegalarum', 'Tuksongo', 'Wanurejo', 'Wringinputih'] },
          { name: 'Muntilan', villages: ['Adikarto', 'Congkrang', 'Gunungpring', 'Keji', 'Menayu', 'Muntilan', 'Ngawen', 'Pucungrejo', 'Sedayu', 'Sokorini', 'Sriwedari', 'Tamanagung', 'Tanjung'] },
        ]
      },
    ]
  },
  {
    id: 'JI',
    name: 'Jawa Timur',
    cities: [
      {
        name: 'Kota Surabaya',
        type: 'Kota',
        districts: [
          { name: 'Gubeng', villages: ['Airlangga', 'Baratajaya', 'Gubeng', 'Kertajaya', 'Mojo', 'Pucangsewu'] },
          { name: 'Wonokromo', villages: ['Darmo', 'Jagir', 'Ngagel', 'Ngagelrejo', 'Sawunggaling', 'Wonokromo'] },
          { name: 'Tegalsari', villages: ['Dr. Soetomo', 'Kedungdoro', 'Keputran', 'Tegalsari', 'Wonorejo'] },
          { name: 'Rungkut', villages: ['Kalirungkut', 'Kedungbaruk', 'Medokan Ayu', 'Penjaringan Sari', 'Rungkut Kidul', 'Rungkut Menanggal', 'Rungkut Tengah', 'Wonorejo'] },
          { name: 'Genteng', villages: ['Embong Kaliasin', 'Genteng', 'Kapasari', 'Ketabang', 'Peneleh'] },
          { name: 'Sukolilo', villages: ['Gebang Putih', 'Keputih', 'Klampis Ngasem', 'Medokan Semampir', 'Menur Pumpungan', 'Nginden Jangkungan', 'Semolowaru'] },
          { name: 'Wiyung', villages: ['Babatan', 'Balas Klumprik', 'Jajar Tunggal', 'Wiyung'] },
          { name: 'Sambikerep', villages: ['Benowo', 'Bringin', 'Lakar Santri', 'Made', 'Sambikerep'] },
        ]
      },
      {
        name: 'Kota Malang',
        type: 'Kota',
        districts: [
          { name: 'Klojen', villages: ['Bareng', 'Gadingasri', 'Kasin', 'Kauman', 'Kiduldalem', 'Klojen', 'Oro-oro Dowo', 'Penanggungan', 'Rampal Celaket', 'Samaan', 'Sukoharjo'] },
          { name: 'Blimbing', villages: ['Arjosari', 'Balearjosari', 'Blimbing', 'Jodipan', 'Kesatrian', 'Pandangwangi', 'Polehan', 'Polowijen', 'Purwantoro', 'Purwodadi'] },
          { name: 'Lowokwaru', villages: ['Dinoyo', 'Jatimulyo', 'Ketawanggede', 'Lowokwaru', 'Merjosari', 'Mojolangu', 'Sumbersari', 'Tasikmadu', 'Tlogomas', 'Tulusrejo', 'Tunggulwulung'] },
          { name: 'Sukun', villages: ['Bakalan Krajan', 'Bandulan', 'Bandungrejosari', 'Ciptomulyo', 'Gadang', 'Karangbesuki', 'Kebonsari', 'Mulyorejo', 'Pisangcandi', 'Sukun', 'Tanjungrejo'] },
        ]
      },
      {
        name: 'Kabupaten Sidoarjo',
        type: 'Kabupaten',
        districts: [
          { name: 'Sidoarjo', villages: ['Banjarbendo', 'Bluru Kidul', 'Bulusidokare', 'Celep', 'Cemengbakalan', 'Cemengkalang', 'Gebang', 'Jati', 'Kemiri', 'Lebo', 'Magersari', 'Pekelingan', 'Pucang', 'Pucanganom', 'Rangkah Kidul', 'Sekardangan', 'Sidokare', 'Sidoklumpuk', 'Sidokumpul', 'Suko', 'Urung-urung'] },
          { name: 'Waru', villages: ['Berbek', 'Bungurasih', 'Janti', 'Kureksari', 'Medaseng', 'Ngingas', 'Pepelegi', 'Sawotratap', 'Tambak Oso', 'Tambak Rejo', 'Tambak Sawah', 'Tambak Sumur', 'Tropodo', 'Waru', 'Wedoro'] },
          { name: 'Gedangan', villages: ['Gagangkepuhsari', 'Gedangan', 'Gempolsari', 'Karangbong', 'Keboan Anom', 'Keboan Sikep', 'Ketajen', 'Kranggan', 'Punggul', 'Sawocangkring', 'Semambung', 'Seruni', 'Tebel', 'Wedoro'] },
          { name: 'Taman', villages: ['Bebekan', 'Geluran', 'Kalijaten', 'Ketegan', 'Kletek', 'Kramatjegu', 'Kureksari', 'Ngelom', 'Sepanjang', 'Sidodadi', 'Taman', 'Tanjungsari', 'Tawangsari', 'Trosobo', 'Wage', 'Wonocolo'] },
        ]
      },
      {
        name: 'Kabupaten Gresik',
        type: 'Kabupaten',
        districts: [
          { name: 'Gresik', villages: ['Bedilan', 'Gapurosukolilo', 'Karangpoh', 'Kebungson', 'Kemuteran', 'Kroman', 'Lumpur', 'Ngipik', 'Pekauman', 'Pekelingan', 'Pulopancikan', 'Sidokumpul', 'Sukodono', 'Sukorame', 'Tlogobendung', 'Tlogopatut', 'Tlogopojok', 'Trate'] },
          { name: 'Kebomas', villages: ['Dahanrejo', 'Giri', 'Gulomantung', 'Kedanyang', 'Kembangan', 'Klangonan', 'Pebat', 'Randuagung', 'Sekarkurung', 'Sidomoro', 'Sidomulyo', 'Sukorejo', 'Tenggilis Mejoyo'] },
          { name: 'Manyar', villages: ['Banyuwangi', 'Betoyoguci', 'Betoyokauman', 'Karangrejo', 'Leran', 'Manyar Komplek', 'Manyar Sidorukun', 'Manyarejo', 'Morobakung', 'Ngampel', 'Peganden', 'Pejangganan', 'Pongangan', 'Roomo', 'Sembayat', 'Suci', 'Sukomulyo', 'Sumberejo', 'Tanggulrejo', 'Tebalo', 'Yosowilangun'] },
        ]
      },
    ]
  },
  {
    id: 'BT',
    name: 'Banten',
    cities: [
      {
        name: 'Kota Tangerang',
        type: 'Kota',
        districts: [
          { name: 'Tangerang', villages: ['Babakan', 'Buaran Indah', 'Cikokol', 'Kelapa Indah', 'Sukarasa', 'Sukasari', 'Tanah Tinggi'] },
          { name: 'Cipondoh', villages: ['Cipondoh', 'Cipondoh Indah', 'Cipondoh Makmur', 'Gondrong', 'Kenanga', 'Petir', 'Poris Plawad', 'Poris Plawad Indah', 'Poris Plawad Utara'] },
          { name: 'Karawaci', villages: ['Bojong Jaya', 'Bugel', 'Cimone', 'Cimone Jaya', 'Gerendeng', 'Karawaci', 'Karawaci Baru', 'Koang Jaya', 'Margasari', 'Nambo Jaya', 'Nusa Jaya', 'Pabuaran', 'Pabuaran Tumpeng', 'Pasir Jaya', 'Sukajadi', 'Sumur Pacing'] },
          { name: 'Ciledug', villages: ['Paninggilan', 'Paninggilan Utara', 'Parung Serab', 'Sudimara Barat', 'Sudimara Jaya', 'Sudimara Selatan', 'Sudimara Timur', 'Tajur'] },
          { name: 'Pinang', villages: ['Cipete', 'Kunciran', 'Kunciran Indah', 'Kunciran Jaya', 'Nerogtog', 'Pakojan', 'Panunggangan', 'Panunggangan Timur', 'Panunggangan Utara', 'Pinang', 'Sudimara Pinang'] },
        ]
      },
      {
        name: 'Kota Tangerang Selatan',
        type: 'Kota',
        districts: [
          { name: 'Serpong', villages: ['Buaran', 'Ciater', 'Cilenggang', 'Lengkong Gudang', 'Lengkong Gudang Timur', 'Lengkong Wetan', 'Rawa Buntu', 'Rawa Mekar Jaya', 'Serpong'] },
          { name: 'Serpong Utara', villages: ['Jelupang', 'Lengkong Karya', 'Paku Jaya', 'Pakualam', 'Pakulonan', 'Pondok Jagung', 'Pondok Jagung Timur'] },
          { name: 'Pondok Aren', villages: ['Jurangmangu Barat', 'Jurangmangu Timur', 'Pondok Aren', 'Pondok Betung', 'Pondok Jaya', 'Pondok Kacang Barat', 'Pondok Kacang Timur', 'Pondok Karya', 'Pondok Pucung', 'Rengas'] },
          { name: 'Pamulang', villages: ['Bambu Apus', 'Benda Baru', 'Kedaung', 'Pamulang Barat', 'Pamulang Timur', 'Pondok Benda', 'Pondok Cabe Ilir', 'Pondok Cabe Udik'] },
          { name: 'Ciputat', villages: ['Cipayung', 'Ciputat', 'Jombang', 'Sawah', 'Sawah Baru', 'Serua', 'Serua Indah'] },
          { name: 'Ciputat Timur', villages: ['Cempaka Putih', 'Cireundeu', 'Pisangan', 'Pondok Ranji', 'Rempoa', 'Rengas'] },
          { name: 'Setu', villages: ['Babakan', 'Bakti Jaya', 'Kademangan', 'Keranggan', 'Muncul', 'Setu'] },
        ]
      },
      {
        name: 'Kabupaten Tangerang',
        type: 'Kabupaten',
        districts: [
          { name: 'Kelapa Dua', villages: ['Bencongan', 'Bencongan Indah', 'Bojong Nangka', 'Curug Sangereng', 'Kelapa Dua', 'Pakulonan Barat'] },
          { name: 'Curug', villages: ['Cukanggalih', 'Curug Kulon', 'Curug Wetan', 'Kadu', 'Kadu Jaya', 'Kertawaluya', 'Sukabakti'] },
          { name: 'Pasar Kemis', villages: ['Gelam Jaya', 'Kuta Baru', 'Kuta Bumi', 'Kuta Jaya', 'Pangadegan', 'Pasar Kemis', 'Sindangsari', 'Sukamantri'] },
          { name: 'Balaraja', villages: ['Balaraja', 'Cangkudu', 'Gembong', 'Saga', 'Sentul', 'Sentul Jaya', 'Sukamurni', 'Talagasari', 'Tobat'] },
          { name: 'Cikupa', villages: ['Bitung Jaya', 'Bojong', 'Budi Mulya', 'Cibadak', 'Cikupa', 'Dukuh', 'Pasir Gadung', 'Pasir Jaya', 'Sukamulya', 'Sukanagara', 'Talaga', 'Talagasari'] },
        ]
      },
      {
        name: 'Kota Serang',
        type: 'Kota',
        districts: [
          { name: 'Serang', villages: ['Cipare', 'Kagungan', 'Kaligandu', 'Kotabaru', 'Lontarbaru', 'Lopang', 'Serang', 'Sukawana', 'Sumurpecung', 'Terondol', 'Unyur'] },
          { name: 'Cipocok Jaya', villages: ['Banjaragung', 'Banjarsari', 'Cipocok Jaya', 'Dalung', 'Gelam', 'Karundang', 'Panancangan', 'Tembong'] },
          { name: 'Curug', villages: ['Cilaku', 'Cipete', 'Curug', 'Curugmanis', 'Kamanisan', 'Pancalaksana', 'Sukajaya', 'Sukalaksana', 'Sukawana', 'Tinggar'] },
          { name: 'Kasemen', villages: ['Banten', 'Bendung', 'Kasemen', 'Kasunyatan', 'Kilasah', 'Margaluyu', 'Mesjid Priyayi', 'Pancur', 'Sawah Luhur', 'Terumbu'] },
          { name: 'Taktakan', villages: ['Cibendung', 'Cilowong', 'Drangong', 'Kalang Anyar', 'Kuranji', 'Lialang', 'Pancur', 'Sayar', 'Sepang', 'Taktakan', 'Umbul Tengah'] },
          { name: 'Walantaka', villages: ['Cigoong', 'Kalodran', 'Kepuren', 'Kiara', 'Lebakwangi', 'Nyapah', 'Pabuaran', 'Pageragung', 'Pasir Buyut', 'Pengampelan', 'Pipitan', 'Tegalsari', 'Teritih', 'Walantaka'] },
        ]
      },
      {
        name: 'Kota Cilegon',
        type: 'Kota',
        districts: [
          { name: 'Cibeber', villages: ['Bulakan', 'Cibeber', 'Cikerai', 'Kalitimbang', 'Karangasem', 'Kedaleman'] },
          { name: 'Cilegon', villages: ['Bagendung', 'Bendungan', 'Ciwandan', 'Ciwedus', 'Jombang Wetan'] },
          { name: 'Grogol', villages: ['Gerem', 'Grogol', 'Kotasari', 'Rawa Arum'] },
          { name: 'Jombang', villages: ['Gedong Dalem', 'Jombang Wetan', 'Masigit', 'Panggung Rawi', 'Sukmajaya'] },
          { name: 'Pulomerak', villages: ['Lebak Gede', 'Mekar Sari', 'Suralaya', 'Tamansari'] },
        ]
      }
    ]
  },
  {
    id: 'YO',
    name: 'DI Yogyakarta',
    cities: [
      {
        name: 'Kota Yogyakarta',
        type: 'Kota',
        districts: [
          { name: 'Danurejan', villages: ['Bausasran', 'Suryatmajan', 'Tegal Panggung'] },
          { name: 'Gedongtengen', villages: ['Pringgokusuman', 'Sosromenduran'] },
          { name: 'Gondokusuman', villages: ['Baciro', 'Demangan', 'Klitren', 'Kotabaru', 'Terban'] },
          { name: 'Gondomanan', villages: ['Ngupasan', 'Prawirodirjan'] },
          { name: 'Kotagede', villages: ['Prenggan', 'Purbayan', 'Rejowinangun'] },
          { name: 'Kraton', villages: ['Kadipaten', 'Panembahan', 'Patehan'] },
          { name: 'Mantrijeron', villages: ['Gedongkiwo', 'Mantrijeron', 'Suryodiningratan'] },
          { name: 'Mergangsan', villages: ['Brontokusuman', 'Keparakan', 'Wirogunan'] },
          { name: 'Ngampilan', villages: ['Ngampilan', 'Notoprajan'] },
          { name: 'Pakualaman', villages: ['Gunungketur', 'Purwokinanti'] },
          { name: 'Tegalrejo', villages: ['Bener', 'Karangwaru', 'Kricak', 'Tegalrejo'] },
          { name: 'Umbulharjo', villages: ['Giwangan', 'Muja Muju', 'Pandeyan', 'Semaki', 'Sorosutan', 'Tahunan', 'Warungboto'] },
          { name: 'Wirobrajan', villages: ['Pakuncen', 'Patangpuluhan', 'Wirobrajan'] },
        ]
      },
      {
        name: 'Kabupaten Sleman',
        type: 'Kabupaten',
        districts: [
          { name: 'Depok', villages: ['Caturtunggal', 'Condongcatur', 'Maguwoharjo'] },
          { name: 'Mlati', villages: ['Sendangadi', 'Sindudadi', 'Sumberadi', 'Tirtoadi', 'Tlogoadi'] },
          { name: 'Gamping', villages: ['Ambarketawang', 'Balecatur', 'Banyuraden', 'Nogotirto', 'Trihanggo'] },
          { name: 'Ngaglik', villages: ['Donoharjo', 'Minomartani', 'Sardonoharjo', 'Sariharjo', 'Sinduharjo', 'Sukoharjo'] },
          { name: 'Kalasan', villages: ['Purwomartani', 'Selomartani', 'Tamanmartani', 'Tirtomartani'] },
          { name: 'Sleman', villages: ['Caturharjo', 'Pandowoharjo', 'Triharjo', 'Trimulyo'] },
        ]
      },
      {
        name: 'Kabupaten Bantul',
        type: 'Kabupaten',
        districts: [
          { name: 'Bantul', villages: ['Bantul', 'Palbapang', 'Ringinharjo', 'Sabdodadi', 'Trirenggo'] },
          { name: 'Banguntapan', villages: ['Banguntapan', 'Baturetno', 'Jagalan', 'Jambidan', 'Potorono', 'Singosaren', 'Tamanan', 'Wirokerten'] },
          { name: 'Sewon', villages: ['Bangunharjo', 'Panggungharjo', 'Pendowoharjo', 'Timbulharjo'] },
          { name: 'Kasihan', villages: ['Bangunjiwo', 'Ngestiharjo', 'Tamantirto', 'Tirtonirmolo'] },
          { name: 'Piyungan', villages: ['Sitimulyo', 'Srimartani', 'Srimulyo'] },
        ]
      },
    ]
  },
  {
    id: 'BA',
    name: 'Bali',
    cities: [
      {
        name: 'Kota Denpasar',
        type: 'Kota',
        districts: [
          { name: 'Denpasar Barat', villages: ['Dauh Puri', 'Dauh Puri Kangin', 'Dauh Puri Kauh', 'Dauh Puri Klod', 'Padangsambian', 'Padangsambian Kaja', 'Padangsambian Klod', 'Pemecutan', 'Pemecutan Klod', 'Tegal Harum', 'Tegal Kerta'] },
          { name: 'Denpasar Selatan', villages: ['Panjer', 'Pedungan', 'Pemogan', 'Renon', 'Sanur', 'Sanur Kaja', 'Sanur Kauh', 'Serangan', 'Sidakarya'] },
          { name: 'Denpasar Timur', villages: ['Dangin Puri', 'Dangin Puri Kaja', 'Dangin Puri Kangin', 'Dangin Puri Kauh', 'Dangin Puri Klod', 'Kesiman', 'Kesiman Kertalangu', 'Kesiman Petilan', 'Penatih', 'Penatih Dangin Puri', 'Sumerta', 'Sumerta Kaja', 'Sumerta Kauh', 'Sumerta Klod'] },
          { name: 'Denpasar Utara', villages: ['Peguyangan', 'Peguyangan Kaja', 'Peguyangan Kangin', 'Pemecutan Kaja', 'Tonja', 'Ubung', 'Ubung Kaja'] },
        ]
      },
      {
        name: 'Kabupaten Badung',
        type: 'Kabupaten',
        districts: [
          { name: 'Kuta', villages: ['Kedonganan', 'Tuban', 'Kuta', 'Legian', 'Seminyak'] },
          { name: 'Kuta Selatan', villages: ['Benoa', 'Jimbaran', 'Kutuh', 'Pecatu', 'Tanjung Benoa', 'Ungasan'] },
          { name: 'Kuta Utara', villages: ['Canggu', 'Dalung', 'Kerobokan', 'Kerobokan Kaja', 'Kerobokan Kelod', 'Tibubeneng'] },
          { name: 'Mengwi', villages: ['Baha', 'Buduk', 'Cemagi', 'Gulingan', 'Kekeran', 'Kuwum', 'Mengwi', 'Mengwitani', 'Munggu', 'Penarungan', 'Pererenan', 'Sembung', 'Sobangan', 'Tumbak Bayuh', 'Werdi Bhuwana'] },
        ]
      },
      {
        name: 'Kabupaten Gianyar',
        type: 'Kabupaten',
        districts: [
          { name: 'Ubud', villages: ['Kedewatan', 'Lodtunduh', 'Mas', 'Petulu', 'Sayan', 'Singakerta', 'Tegallalang', 'Ubud'] },
          { name: 'Gianyar', villages: ['Bakbakan', 'Bedulu', 'Beng', 'Bitera', 'Gianyar', 'Lebih', 'Petak', 'Petak Kaja', 'Serongga', 'Siangan', 'Sidan', 'Suwat', 'Tegal Tugu', 'Tulikup'] },
          { name: 'Sukawati', villages: ['Batuan', 'Batuan Kaler', 'Batubulan', 'Batubulan Kangin', 'Celuk', 'Guwang', 'Kemenuh', 'Ketewel', 'Singapadu', 'Singapadu Kaler', 'Singapadu Tengah', 'Sukawati'] },
        ]
      }
    ]
  },
  {
    id: 'SU',
    name: 'Sumatera Utara',
    cities: [
      {
        name: 'Kota Medan',
        type: 'Kota',
        districts: [
          { name: 'Medan Kota', villages: ['Mesjid', 'Pasar Baru', 'Pasar Merah Barat', 'Pusat Pasar', 'Sitirejo I', 'Sudirejo I', 'Sudirejo II', 'Teladan Barat', 'Teladan Timur'] },
          { name: 'Medan Petisah', villages: ['Petisah Tengah', 'Sekip', 'Sei Putih Barat', 'Sei Putih Tengah', 'Sei Putih Timur I', 'Sei Putih Timur II', 'Silalas'] },
          { name: 'Medan Baru', villages: ['Babura', 'Darat', 'Merdeka', 'Padang Bulan', 'Petisah Hulu', 'Titi Rantai'] },
          { name: 'Medan Sunggal', villages: ['Babura Sunggal', 'Lalang', 'Sei Sikambing B', 'Simpang Tanjung', 'Sunggal', 'Tanjung Rejo'] },
          { name: 'Medan Helvetia', villages: ['Cinta Damai', 'Dwikora', 'Helvetia', 'Helvetia Tengah', 'Helvetia Timur', 'Sei Sikambing C II', 'Tanjung Gusta'] },
          { name: 'Medan Denai', villages: ['Binjai', 'Denai', 'Medan Tenggara', 'Tegal Sari Mandala I', 'Tegal Sari Mandala II', 'Tegal Sari Mandala III'] },
        ]
      },
      {
        name: 'Kabupaten Deli Serdang',
        type: 'Kabupaten',
        districts: [
          { name: 'Lubuk Pakam', villages: ['Bakaran Batu', 'Cemara', 'Dagang Bambu', 'Dagang Kelambir', 'Hulu', 'Lubuk Pakam I-II', 'Lubuk Pakam III', 'Lubuk Pakam Pekan', 'Namu Buaya', 'Pagar Jati', 'Pagar Merbau III', 'Paluh Kemiri', 'Pasar Melintang', 'Petapahan', 'Sekip', 'Syahmad', 'Tanjung Garbus I'] },
          { name: 'Percut Sei Tuan', villages: ['Amplas', 'Bandar Khalipah', 'Bandar Klippa', 'Bandar Setia', 'Cinta Damai', 'Cinta Rakyat', 'Kolam', 'Laut Dendang', 'Medan Estate', 'Pematang Lalang', 'Percut', 'Saentis', 'Sambirejo Timur', 'Sampali', 'Sei Rotan', 'Tanjung Rejo', 'Tanjung Selamat', 'Tembung'] },
        ]
      }
    ]
  },
  {
    id: 'SS',
    name: 'Sumatera Selatan',
    cities: [
      {
        name: 'Kota Palembang',
        type: 'Kota',
        districts: [
          { name: 'Ilir Barat I', villages: ['Bukit Baru', 'Bukit Lama', 'Demang Lebar Daun', 'Lorok Pakjo', 'Padang Selasa', 'Siring Agung'] },
          { name: 'Ilir Timur I', villages: ['13 Ilir', '14 Ilir', '15 Ilir', '16 Ilir', '17 Ilir', '18 Ilir', '20 Ilir D-I', '20 Ilir D-III', '20 Ilir D-IV', 'Kepandean', 'Sungai Pangeran'] },
          { name: 'Sukarami', villages: ['Kebun Bunga', 'Sukabangun', 'Sukajaya', 'Sukamaju', 'Sukarami', 'Talang Betutu', 'Talang Jambe'] },
          { name: 'Seberang Ulu I', villages: ['1 Ulu', '2 Ulu', '3-4 Ulu', '5 Ulu', '7 Ulu', 'Silaberanti', 'Tuan Kentang'] },
        ]
      }
    ]
  },
  {
    id: 'SB',
    name: 'Sumatera Barat',
    cities: [
      {
        name: 'Kota Padang',
        type: 'Kota',
        districts: [
          { name: 'Padang Barat', villages: ['Belakang Tangsi', 'Berok Nipah', 'Flamboyan Baru', 'Kampung Jao', 'Kampung Pondok', 'Olo', 'Padang Pasir', 'Purus', 'Rimbo Kaluang', 'Ujung Gurun'] },
          { name: 'Padang Timur', villages: ['Andalas', 'Ganting', 'Ganting Parak Gadang', 'Jati', 'Jati Baru', 'Kubu Marapalam', 'Kubu Parak Karakah', 'Marapalam', 'Parak Gadang Timur', 'Sawahan', 'Sawahan Timur', 'Simpang Haru'] },
          { name: 'Koto Tangah', villages: ['Air Pacah', 'Balai Gadang', 'Batang Kabung Ganting', 'Batipuh Panjang', 'Bungo Pasang', 'Dadok Tunggul Hitam', 'Koto Panjang Ikur Koto', 'Koto Pulai', 'Lubuk Buaya', 'Padang Sarai', 'Pasir Nan Tigo', 'Tunggul Hitam'] },
        ]
      }
    ]
  },
  {
    id: 'RI',
    name: 'Riau',
    cities: [
      {
        name: 'Kota Pekanbaru',
        type: 'Kota',
        districts: [
          { name: 'Marpoyan Damai', villages: ['Maharatu', 'Perhentian Marpoyan', 'Sidomulyo Timur', 'Tangkerang Barat', 'Tangkerang Tengah', 'Wonorejo'] },
          { name: 'Tampan', villages: ['Delima', 'Sidomulyo Barat', 'Simpang Baru', 'Tobek Godang', 'Tuah Karya'] },
          { name: 'Payung Sekaki', villages: ['Air Hitam', 'Bandar Raya', 'Labuh Baru Barat', 'Labuh Baru Timur', 'Tampan', 'Tirta Siak'] },
          { name: 'Bukit Raya', villages: ['Air Dingin', 'Simpang Tiga', 'Tangkerang Labuai', 'Tangkerang Selatan', 'Tangkerang Utara'] },
        ]
      }
    ]
  },
  {
    id: 'KR',
    name: 'Kepulauan Riau',
    cities: [
      {
        name: 'Kota Batam',
        type: 'Kota',
        districts: [
          { name: 'Batam Kota', villages: ['Baloi Permai', 'Belian', 'Sukajadi', 'Sungai Panas', 'Taman Baloi', 'Teluk Tering'] },
          { name: 'Lubuk Baja', villages: ['Baloi Indah', 'Batu Selicin', 'Kampung Pelita', 'Lubuk Baja Kota', 'Tanjung Uma'] },
          { name: 'Sekupang', villages: ['Patam Lestari', 'Sungai Harapan', 'Tanjung Pinggir', 'Tanjung Riau', 'Tiban Baru', 'Tiban Indah', 'Tiban Lama'] },
          { name: 'Nongsa', villages: ['Batu Besar', 'Kabil', 'Ngenang', 'Sambau'] },
          { name: 'Batu Aji', villages: ['Bukit Tempayan', 'Buliang', 'Kibing', 'Tanjung Uncang'] },
        ]
      }
    ]
  },
  {
    id: 'LA',
    name: 'Lampung',
    cities: [
      {
        name: 'Kota Bandar Lampung',
        type: 'Kota',
        districts: [
          { name: 'Tanjung Karang Pusat', villages: ['Durian Payung', 'Gotong Royong', 'Kaliawi', 'Kaliawi Persada', 'Kelapa Tiga', 'Palapa', 'Pasir Gintung', 'Pelita'] },
          { name: 'Kedaton', villages: ['Kedaton', 'Penengahan', 'Penengahan Raya', 'Sukamenanti', 'Sukamenanti Baru', 'Surabaya', 'Tegalsari'] },
          { name: 'Way Halim', villages: ['Gunung Sulah', 'Jagabaya I', 'Jagabaya II', 'Jagabaya III', 'Perumnas Way Halim', 'Way Halim Permai'] },
          { name: 'Rajabasa', villages: ['Gedong Meneng', 'Gedong Meneng Baru', 'Rajabasa', 'Rajabasa Jaya', 'Rajabasa Nunyai', 'Rajabasa Pemuka', 'Rajabasa Raya'] },
        ]
      }
    ]
  },
  {
    id: 'KS',
    name: 'Kalimantan Selatan',
    cities: [
      {
        name: 'Kota Banjarmasin',
        type: 'Kota',
        districts: [
          { name: 'Banjarmasin Tengah', villages: ['Antasan Besar', 'Gadang', 'Kertak Baru Ilir', 'Kertak Baru Ulu', 'Mawar', 'Melayu', 'Pasar Lama', 'Pekapuran Laut', 'Seberang Mesjid', 'Sungai Baru', 'Teluk Dalam', 'Kelayan Luar'] },
          { name: 'Banjarmasin Barat', villages: ['Belitung Selatan', 'Belitung Utara', 'Kuin Cerucuk', 'Kuin Selatan', 'Pelambuan', 'Telaga Biru', 'Teluk Tiram'] },
          { name: 'Banjarmasin Selatan', villages: ['Basirih', 'Kelayan Barat', 'Kelayan Dalam', 'Kelayan Tengah', 'Kelayan Timur', 'Mantuil', 'Murung Raya', 'Pekauman', 'Pemurus Baru', 'Pemurus Dalam', 'Tanjung Pagar'] },
          { name: 'Banjarmasin Timur', villages: ['Benua Anyar', 'Karang Mekar', 'Kebun Bunga', 'Kuripan', 'Pekapuran Raya', 'Pengambangan', 'Sungai Bilu', 'Sungai Lulut'] },
          { name: 'Banjarmasin Utara', villages: ['Alalak Selatan', 'Alalak Tengah', 'Alalak Utara', 'Antasan Kecil Timur', 'Kuin Utara', 'Pangeran', 'Sungai Andai', 'Sungai Jingah', 'Sungai Miai', 'Surangi'] },
        ]
      }
    ]
  },
  {
    id: 'KT',
    name: 'Kalimantan Timur',
    cities: [
      {
        name: 'Kota Balikpapan',
        type: 'Kota',
        districts: [
          { name: 'Balikpapan Kota', villages: ['Damai', 'Klandasan Ilir', 'Klandasan Ulu', 'Prapatan', 'Telaga Sari'] },
          { name: 'Balikpapan Selatan', villages: ['Damai Bahagia', 'Damai Baru', 'Gunung Bahagia', 'Sepinggan', 'Sepinggan Baru', 'Sepinggan Raya', 'Sungai Nangka'] },
          { name: 'Balikpapan Tengah', villages: ['Gunung Sari Ilir', 'Gunung Sari Ulu', 'Karang Jati', 'Karang Rejo', 'Mekar Sari', 'Sumber Rejo'] },
          { name: 'Balikpapan Utara', villages: ['Batu Ampar', 'Graha Indah', 'Gunung Samarinda', 'Gunung Samarinda Baru', 'Karang Joang', 'Muara Rapak'] },
        ]
      },
      {
        name: 'Kota Samarinda',
        type: 'Kota',
        districts: [
          { name: 'Samarinda Kota', villages: ['Bugis', 'Karang Mumus', 'Pelabuhan', 'Pasar Pagi', 'Sungai Pinang Luar'] },
          { name: 'Samarinda Ulu', villages: ['Air Hitam', 'Air Putih', 'Bukit Pinang', 'Dadi Mulya', 'Gunung Kelua', 'Jawa', 'Sidodadi', 'Teluk Lerong Ilir'] },
        ]
      }
    ]
  },
  {
    id: 'SN',
    name: 'Sulawesi Selatan',
    cities: [
      {
        name: 'Kota Makassar',
        type: 'Kota',
        districts: [
          { name: 'Ujung Pandang', villages: ['Baru', 'Bulo Gading', 'Lae-Lae', 'Lajangiru', 'Losari', 'Maloku', 'Mangkura', 'Pisang Selatan', 'Pisang Utara', 'Sawerigading'] },
          { name: 'Panakkukang', villages: ['Karampuang', 'Kassi-Kassi', 'Masale', 'Pampang', 'Panaikang', 'Pandang', 'Paropo', 'Sinrijawa', 'Tamamaung', 'Tellumpoccoe', 'Tello Baru'] },
          { name: 'Rappocini', villages: ['Balla Parang', 'Banta-Bantaeng', 'Bonto Makkio', 'Bontoala', 'Buakana', 'Gunung Sari', 'Karunrung', 'Kassi-Kassi', 'Mappala', 'Minasa Upa', 'Rappocini', 'Tidung'] },
          { name: 'Tamalanrea', villages: ['Bira', 'Kapasa', 'Kapasa Raya', 'Parang Tambung', 'Tamalanrea', 'Tamalanrea Indah', 'Tamalanrea Jaya'] },
        ]
      }
    ]
  },
  {
    id: 'AC',
    name: 'Aceh',
    cities: [
      {
        name: 'Kota Banda Aceh',
        type: 'Kota',
        districts: [
          { name: 'Kuta Alam', villages: ['Bandar Baru', 'Beurawe', 'Keuramat', 'Kuta Alam', 'Laksana', 'Lamdingin', 'Lampulo', 'Mulio', 'Peunayong', 'Peuniti', 'Lambaro Skep'] },
          { name: 'Baiturrahman', villages: ['Ateuk Jawo', 'Ateuk Deah Tanoh', 'Ateuk Munjeng', 'Ateuk Pahlawan', 'Kampung Baru', 'Neusu Aceh', 'Neusu Jaya', 'Peuniti', 'Seutui', 'Sukaramai'] },
          { name: 'Syiah Kuala', villages: ['Alue Naga', 'Deah Raya', 'Ie Masen Kaye Adang', 'Jeulingke', 'Kopelma Darussalam', 'Lamgugob', 'Peurada', 'Pineung', 'Rukoh', 'Tibang'] },
        ]
      }
    ]
  },
  {
    id: 'NB',
    name: 'Nusa Tenggara Barat',
    cities: [
      {
        name: 'Kota Mataram',
        type: 'Kota',
        districts: [
          { name: 'Mataram', villages: ['Mataram Barat', 'Mataram Timur', 'Pagesangan', 'Pagesangan Barat', 'Pagesangan Timur', 'Pagutan', 'Pagutan Barat', 'Pagutan Timur', 'Pejanggik', 'Punia'] },
          { name: 'Ampenan', villages: ['Ampenan Selatan', 'Ampenan Tengah', 'Ampenan Utara', 'Banjar', 'Bintaro', 'Dayan Peken', 'Kebun Sari', 'Pejeruk', 'Taman Sari'] },
          { name: 'Cakranegara', villages: ['Cakranegara Barat', 'Cakranegara Selatan', 'Cakranegara Selatan Baru', 'Cakranegara Timur', 'Cakranegara Utara', 'Cilinaya', 'Karang Taliwang', 'Mayura', 'Sapta Marga', 'Sayang-Sayang'] },
        ]
      }
    ]
  },
  {
    id: 'PA',
    name: 'Papua',
    cities: [
      {
        name: 'Kota Jayapura',
        type: 'Kota',
        districts: [
          { name: 'Jayapura Utara', villages: ['Angkasapura', 'Bayangkara', 'Gurabesi', 'Imbi', 'Mandala', 'Tanjung Ria', 'Trikora'] },
          { name: 'Jayapura Selatan', villages: ['Argapura', 'Entrop', 'Hamadi', 'Numbai', 'Tahima Soroma', 'Tobati'] },
          { name: 'Abepura', villages: ['Abepantai', 'Asano', 'Awiyo', 'Enggros', 'Kota Baru', 'Koya Barat', 'Koya Timur', 'Nafri', 'Vim', 'Wahno', 'Way Mhorock', 'Yobe'] },
        ]
      }
    ]
  },
];

// All 38 Indonesian Provinces with standard administrative regencies and cities
export const ALL_INDONESIA_PROVINCES = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Kepulauan Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Banten',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Gorontalo',
  'Sulawesi Tengah',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Barat Daya',
];

// Fallback / Representative cities for provinces not fully detailed in the nested tree
export const PROVINCE_CITIES_MAP: Record<string, string[]> = {
  'Aceh': ['Kota Banda Aceh', 'Kota Sabang', 'Kota Lhokseumawe', 'Kota Langsa', 'Kota Subulussalam', 'Kabupaten Aceh Besar', 'Kabupaten Aceh Barat', 'Kabupaten Aceh Tengah', 'Kabupaten Aceh Timur', 'Kabupaten Aceh Utara', 'Kabupaten Bireuen', 'Kabupaten Pidie', 'Kabupaten Aceh Selatan', 'Kabupaten Aceh Singkil', 'Kabupaten Aceh Tenggara', 'Kabupaten Aceh Barat Daya', 'Kabupaten Gayo Lues', 'Kabupaten Nagan Raya', 'Kabupaten Aceh Jaya', 'Kabupaten Bener Meriah', 'Kabupaten Pidie Jaya', 'Kabupaten Simeulue'],
  'Sumatera Utara': ['Kota Medan', 'Kota Pematangsiantar', 'Kota Sibolga', 'Kota Tanjungbalai', 'Kota Binjai', 'Kota Tebing Tinggi', 'Kota Padang Sidempuan', 'Kota Gunungsitoli', 'Kabupaten Deli Serdang', 'Kabupaten Karo', 'Kabupaten Asahan', 'Kabupaten Simalungun', 'Kabupaten Langkat', 'Kabupaten Dairi', 'Kabupaten Toba', 'Kabupaten Mandailing Natal', 'Kabupaten Tapanuli Selatan', 'Kabupaten Tapanuli Tengah', 'Kabupaten Tapanuli Utara', 'Kabupaten Labuhanbatu', 'Kabupaten Labuhanbatu Utara', 'Kabupaten Labuhanbatu Selatan', 'Kabupaten Nias', 'Kabupaten Nias Selatan', 'Kabupaten Nias Utara', 'Kabupaten Nias Barat', 'Kabupaten Pakpak Bharat', 'Kabupaten Humbang Hasundutan', 'Kabupaten Samosir', 'Kabupaten Serdang Bedagai', 'Kabupaten Batu Bara', 'Kabupaten Padang Lawas', 'Kabupaten Padang Lawas Utara'],
  'Sumatera Barat': ['Kota Padang', 'Kota Bukittinggi', 'Kota Solok', 'Kota Sawahlunto', 'Kota Padang Panjang', 'Kota Payakumbuh', 'Kota Pariaman', 'Kabupaten Agam', 'Kabupaten Tanah Datar', 'Kabupaten Pesisir Selatan', 'Kabupaten Pasaman', 'Kabupaten Pasaman Barat', 'Kabupaten Limapuluh Kota', 'Kabupaten Padang Pariaman', 'Kabupaten Solok', 'Kabupaten Solok Selatan', 'Kabupaten Sijunjung', 'Kabupaten Dharmasraya', 'Kabupaten Kepulauan Mentawai'],
  'Riau': ['Kota Pekanbaru', 'Kota Dumai', 'Kabupaten Kampar', 'Kabupaten Bengkalis', 'Kabupaten Indragiri Hulu', 'Kabupaten Indragiri Hilir', 'Kabupaten Pelalawan', 'Kabupaten Rokan Hulu', 'Kabupaten Rokan Hilir', 'Kabupaten Siak', 'Kabupaten Kuantan Singingi', 'Kabupaten Kepulauan Meranti'],
  'Kepulauan Riau': ['Kota Batam', 'Kota Tanjungpinang', 'Kabupaten Bintan', 'Kabupaten Karimun', 'Kabupaten Natuna', 'Kabupaten Lingga', 'Kabupaten Kepulauan Anambas'],
  'Jambi': ['Kota Jambi', 'Kota Sungai Penuh', 'Kabupaten Batanghari', 'Kabupaten Bungo', 'Kabupaten Kerinci', 'Kabupaten Merangin', 'Kabupaten Muaro Jambi', 'Kabupaten Sarolangun', 'Kabupaten Tanjung Jabung Barat', 'Kabupaten Tanjung Jabung Timur', 'Kabupaten Tebo'],
  'Sumatera Selatan': ['Kota Palembang', 'Kota Pagar Alam', 'Kota Lubuklinggau', 'Kota Prabumulih', 'Kabupaten Banyuasin', 'Kabupaten Empat Lawang', 'Kabupaten Lahat', 'Kabupaten Muara Enim', 'Kabupaten Musi Banyuasin', 'Kabupaten Musi Rawas', 'Kabupaten Musi Rawas Utara', 'Kabupaten Ogan Ilir', 'Kabupaten Ogan Komering Ilir', 'Kabupaten Ogan Komering Ulu', 'Kabupaten Ogan Komering Ulu Selatan', 'Kabupaten Ogan Komering Ulu Timur', 'Kabupaten Penukal Abab Lematang Ilir'],
  'Kepulauan Bangka Belitung': ['Kota Pangkalpinang', 'Kabupaten Bangka', 'Kabupaten Bangka Barat', 'Kabupaten Bangka Selatan', 'Kabupaten Bangka Tengah', 'Kabupaten Belitung', 'Kabupaten Belitung Timur'],
  'Bengkulu': ['Kota Bengkulu', 'Kabupaten Bengkulu Selatan', 'Kabupaten Bengkulu Tengah', 'Kabupaten Bengkulu Utara', 'Kabupaten Kaur', 'Kabupaten Kepahiang', 'Kabupaten Lebong', 'Kabupaten Mukomuko', 'Kabupaten Rejang Lebong', 'Kabupaten Seluma'],
  'Lampung': ['Kota Bandar Lampung', 'Kota Metro', 'Kabupaten Lampung Barat', 'Kabupaten Lampung Selatan', 'Kabupaten Lampung Tengah', 'Kabupaten Lampung Timur', 'Kabupaten Lampung Utara', 'Kabupaten Mesuji', 'Kabupaten Pesawaran', 'Kabupaten Pesisir Barat', 'Kabupaten Pringsewu', 'Kabupaten Tanggamus', 'Kabupaten Tulang Bawang', 'Kabupaten Tulang Bawang Barat', 'Kabupaten Way Kanan'],
  'DKI Jakarta': ['Kota Jakarta Selatan', 'Kota Jakarta Pusat', 'Kota Jakarta Barat', 'Kota Jakarta Timur', 'Kota Jakarta Utara', 'Kabupaten Kepulauan Seribu'],
  'Jawa Barat': ['Kota Bandung', 'Kota Bekasi', 'Kota Bogor', 'Kota Cimahi', 'Kota Cirebon', 'Kota Depok', 'Kota Sukabumi', 'Kota Tasikmalaya', 'Kota Banjar', 'Kabupaten Bandung', 'Kabupaten Bandung Barat', 'Kabupaten Bekasi', 'Kabupaten Bogor', 'Kabupaten Ciamis', 'Kabupaten Cianjur', 'Kabupaten Cirebon', 'Kabupaten Garut', 'Kabupaten Indramayu', 'Kabupaten Karawang', 'Kabupaten Kuningan', 'Kabupaten Majalengka', 'Kabupaten Pangandaran', 'Kabupaten Purwakarta', 'Kabupaten Subang', 'Kabupaten Sukabumi', 'Kabupaten Sumedang', 'Kabupaten Tasikmalaya'],
  'Banten': ['Kota Tangerang', 'Kota Tangerang Selatan', 'Kota Serang', 'Kota Cilegon', 'Kabupaten Tangerang', 'Kabupaten Serang', 'Kabupaten Pandeglang', 'Kabupaten Lebak'],
  'Jawa Tengah': ['Kota Semarang', 'Kota Surakarta (Solo)', 'Kota Magelang', 'Kota Pekalongan', 'Kota Salatiga', 'Kota Tegal', 'Kabupaten Banyumas (Purwokerto)', 'Kabupaten Batang', 'Kabupaten Blora', 'Kabupaten Boyolali', 'Kabupaten Brebes', 'Kabupaten Cilacap', 'Kabupaten Demak', 'Kabupaten Grobogan', 'Kabupaten Jepara', 'Kabupaten Karanganyar', 'Kabupaten Kebumen', 'Kabupaten Kendal', 'Kabupaten Klaten', 'Kabupaten Kudus', 'Kabupaten Magelang', 'Kabupaten Pati', 'Kabupaten Pekalongan', 'Kabupaten Pemalang', 'Kabupaten Purbalingga', 'Kabupaten Purworejo', 'Kabupaten Rembang', 'Kabupaten Semarang', 'Kabupaten Sragen', 'Kabupaten Sukoharjo', 'Kabupaten Tegal', 'Kabupaten Temanggung', 'Kabupaten Wonogiri', 'Kabupaten Wonosobo', 'Kabupaten Banjarnegara'],
  'DI Yogyakarta': ['Kota Yogyakarta', 'Kabupaten Sleman', 'Kabupaten Bantul', 'Kabupaten Kulon Progo', 'Kabupaten Gunungkidul'],
  'Jawa Timur': ['Kota Surabaya', 'Kota Malang', 'Kota Batu', 'Kota Blitar', 'Kota Kediri', 'Kota Madiun', 'Kota Mojokerto', 'Kota Pasuruan', 'Kota Probolinggo', 'Kabupaten Sidoarjo', 'Kabupaten Gresik', 'Kabupaten Banyuwangi', 'Kabupaten Jember', 'Kabupaten Bojonegoro', 'Kabupaten Tuban', 'Kabupaten Lamongan', 'Kabupaten Pasuruan', 'Kabupaten Mojokerto', 'Kabupaten Malang', 'Kabupaten Kediri', 'Kabupaten Blitar', 'Kabupaten Tulungagung', 'Kabupaten Nganjuk', 'Kabupaten Madiun', 'Kabupaten Magetan', 'Kabupaten Ngawi', 'Kabupaten Ponorogo', 'Kabupaten Pacitan', 'Kabupaten Trenggalek', 'Kabupaten Probolinggo', 'Kabupaten Lumajang', 'Kabupaten Bondowoso', 'Kabupaten Situbondo', 'Kabupaten Bangkalan', 'Kabupaten Sampang', 'Kabupaten Pamekasan', 'Kabupaten Sumenep'],
  'Bali': ['Kota Denpasar', 'Kabupaten Badung', 'Kabupaten Gianyar', 'Kabupaten Tabanan', 'Kabupaten Buleleng', 'Kabupaten Karangasem', 'Kabupaten Klungkung', 'Kabupaten Bangli', 'Kabupaten Jembrana'],
  'Nusa Tenggara Barat': ['Kota Mataram', 'Kota Bima', 'Kabupaten Lombok Barat', 'Kabupaten Lombok Tengah', 'Kabupaten Lombok Timur', 'Kabupaten Lombok Utara', 'Kabupaten Sumbawa', 'Kabupaten Sumbawa Barat', 'Kabupaten Dompu', 'Kabupaten Bima'],
  'Nusa Tenggara Timur': ['Kota Kupang', 'Kabupaten Flores Timur', 'Kabupaten Manggarai', 'Kabupaten Manggarai Barat (Labuan Bajo)', 'Kabupaten Manggarai Timur', 'Kabupaten Sikka', 'Kabupaten Ende', 'Kabupaten Sumba Timur', 'Kabupaten Sumba Barat', 'Kabupaten Sumba Barat Daya', 'Kabupaten Sumba Tengah', 'Kabupaten Belu', 'Kabupaten Timor Tengah Selatan', 'Kabupaten Timor Tengah Utara', 'Kabupaten Alor', 'Kabupaten Lembata', 'Kabupaten Rote Ndao', 'Kabupaten Sabu Raijua', 'Kabupaten Malaka', 'Kabupaten Nagekeo', 'Kabupaten Ngada'],
  'Kalimantan Barat': ['Kota Pontianak', 'Kota Singkawang', 'Kabupaten Kubu Raya', 'Kabupaten Mempawah', 'Kabupaten Sambas', 'Kabupaten Sanggau', 'Kabupaten Ketapang', 'Kabupaten Sintang', 'Kabupaten Kapuas Hulu', 'Kabupaten Bengkayang', 'Kabupaten Landak', 'Kabupaten Melawi', 'Kabupaten Sekadau', 'Kabupaten Kayong Utara'],
  'Kalimantan Tengah': ['Kota Palangka Raya', 'Kabupaten Kotawaringin Timur (Sampit)', 'Kabupaten Kotawaringin Barat (Pangkalan Bun)', 'Kabupaten Kapuas', 'Kabupaten Barito Selatan', 'Kabupaten Barito Utara', 'Kabupaten Barito Timur', 'Kabupaten Katingan', 'Kabupaten Seruyan', 'Kabupaten Sukamara', 'Kabupaten Lamandau', 'Kabupaten Gunung Mas', 'Kabupaten Murung Raya', 'Kabupaten Pulang Pisau'],
  'Kalimantan Selatan': ['Kota Banjarmasin', 'Kota Banjarbaru', 'Kabupaten Banjar (Martapura)', 'Kabupaten Tanah Bumbu', 'Kabupaten Kotabaru', 'Kabupaten Barito Kuala', 'Kabupaten Tapin', 'Kabupaten Hulu Sungai Selatan', 'Kabupaten Hulu Sungai Tengah', 'Kabupaten Hulu Sungai Utara', 'Kabupaten Tabalong', 'Kabupaten Tanah Laut', 'Kabupaten Balangan'],
  'Kalimantan Timur': ['Kota Samarinda', 'Kota Balikpapan', 'Kota Bontang', 'Kabupaten Kutai Kartanegara', 'Kabupaten Kutai Timur', 'Kabupaten Berau', 'Kabupaten Paser', 'Kabupaten Penajam Paser Utara (IKN Nusantara)', 'Kabupaten Kutai Barat', 'Kabupaten Mahakam Ulu'],
  'Kalimantan Utara': ['Kota Tarakan', 'Kabupaten Bulungan (Tanjung Selor)', 'Kabupaten Malinau', 'Kabupaten Nunukan', 'Kabupaten Tana Tidung'],
  'Sulawesi Utara': ['Kota Manado', 'Kota Bitung', 'Kota Tomohon', 'Kota Kotamobagu', 'Kabupaten Minahasa', 'Kabupaten Minahasa Utara', 'Kabupaten Minahasa Selatan', 'Kabupaten Minahasa Tenggara', 'Kabupaten Bolaang Mongondow', 'Kabupaten Bolaang Mongondow Utara', 'Kabupaten Bolaang Mongondow Selatan', 'Kabupaten Bolaang Mongondow Timur', 'Kabupaten Kepulauan Sangihe', 'Kabupaten Kepulauan Talaud', 'Kabupaten Kepulauan Siau Tagulandang Biaro'],
  'Gorontalo': ['Kota Gorontalo', 'Kabupaten Gorontalo', 'Kabupaten Bone Bolango', 'Kabupaten Boalemo', 'Kabupaten Pohuwato', 'Kabupaten Gorontalo Utara'],
  'Sulawesi Tengah': ['Kota Palu', 'Kabupaten Donggala', 'Kabupaten Sigi', 'Kabupaten Parigi Moutong', 'Kabupaten Poso', 'Kabupaten Banggai (Luwuk)', 'Kabupaten Banggai Kepulauan', 'Kabupaten Banggai Laut', 'Kabupaten Tolitoli', 'Kabupaten Buol', 'Kabupaten Morowali', 'Kabupaten Morowali Utara', 'Kabupaten Tojo Una-Una'],
  'Sulawesi Barat': ['Kabupaten Mamuju', 'Kabupaten Majene', 'Kabupaten Polewali Mandar', 'Kabupaten Pasangkayu', 'Kabupaten Mamasa', 'Kabupaten Mamuju Tengah'],
  'Sulawesi Selatan': ['Kota Makassar', 'Kota Palopo', 'Kota Parepare', 'Kabupaten Gowa', 'Kabupaten Maros', 'Kabupaten Bone', 'Kabupaten Bulukumba', 'Kabupaten Bantaeng', 'Kabupaten Sinjai', 'Kabupaten Wajo', 'Kabupaten Luwu', 'Kabupaten Luwu Timur', 'Kabupaten Luwu Utara', 'Kabupaten Tana Toraja', 'Kabupaten Toraja Utara', 'Kabupaten Pinrang', 'Kabupaten Sidenreng Rappang (Sidrap)', 'Kabupaten Soppeng', 'Kabupaten Barru', 'Kabupaten Pangkajene dan Kepulauan (Pangkep)', 'Kabupaten Takalar', 'Kabupaten Jeneponto', 'Kabupaten Kepulauan Selayar', 'Kabupaten Enrekang'],
  'Sulawesi Tenggara': ['Kota Kendari', 'Kota Baubau', 'Kabupaten Konawe', 'Kabupaten Konawe Selatan', 'Kabupaten Konawe Utara', 'Kabupaten Konawe Kepulauan', 'Kabupaten Kolaka', 'Kabupaten Kolaka Utara', 'Kabupaten Kolaka Timur', 'Kabupaten Muna', 'Kabupaten Muna Barat', 'Kabupaten Wakatobi', 'Kabupaten Buton', 'Kabupaten Buton Selatan', 'Kabupaten Buton Tengah', 'Kabupaten Buton Utara', 'Kabupaten Bombana'],
  'Maluku': ['Kota Ambon', 'Kota Tual', 'Kabupaten Maluku Tengah', 'Kabupaten Maluku Tenggara', 'Kabupaten Kepulauan Tanimbar', 'Kabupaten Seram Bagian Barat', 'Kabupaten Seram Bagian Timur', 'Kabupaten Buru', 'Kabupaten Buru Selatan', 'Kabupaten Kepulauan Aru', 'Kabupaten Maluku Barat Daya'],
  'Maluku Utara': ['Kota Ternate', 'Kota Tidore Kepulauan', 'Kabupaten Halmahera Utara', 'Kabupaten Halmahera Selatan', 'Kabupaten Halmahera Barat', 'Kabupaten Halmahera Timur', 'Kabupaten Halmahera Tengah', 'Kabupaten Pulau Morotai', 'Kabupaten Kepulauan Sula', 'Kabupaten Pulau Taliabu'],
  'Papua': ['Kota Jayapura', 'Kabupaten Jayapura', 'Kabupaten Keerom', 'Kabupaten Sarmi', 'Kabupaten Biak Numfor', 'Kabupaten Kepulauan Yapen', 'Kabupaten Mamberamo Raya', 'Kabupaten Supiori', 'Kabupaten Waropen'],
  'Papua Barat': ['Kabupaten Manokwari', 'Kabupaten Manokwari Selatan', 'Kabupaten Pegunungan Arfak', 'Kabupaten Fakfak', 'Kabupaten Kaimana', 'Kabupaten Teluk Bintuni', 'Kabupaten Teluk Wondama'],
  'Papua Selatan': ['Kabupaten Merauke', 'Kabupaten Boven Digoel', 'Kabupaten Mappi', 'Kabupaten Asmat'],
  'Papua Tengah': ['Kabupaten Nabire', 'Kabupaten Mimika (Timika)', 'Kabupaten Paniai', 'Kabupaten Puncak Jaya', 'Kabupaten Puncak', 'Kabupaten Dogiyai', 'Kabupaten Intan Jaya', 'Kabupaten Deiyai'],
  'Papua Pegunungan': ['Kabupaten Jayawijaya (Wamena)', 'Kabupaten Lanny Jaya', 'Kabupaten Yahukimo', 'Kabupaten Tolikara', 'Kabupaten Nduga', 'Kabupaten Yalimo', 'Kabupaten Mamberamo Tengah', 'Kabupaten Pegunungan Bintang'],
  'Papua Barat Daya': ['Kota Sorong', 'Kabupaten Sorong', 'Kabupaten Sorong Selatan', 'Kabupaten Raja Ampat', 'Kabupaten Tambrauw', 'Kabupaten Maybrat'],
};

// Comprehensive Indonesian Districts (Kecamatan) mapped by City/Regency Name
export const CITY_DISTRICTS_MAP: Record<string, string[]> = {
  // --- JAWA BARAT ---
  'Kota Bandung': ['Coblong', 'Sukasari', 'Cicendo', 'Sumur Bandung', 'Lengkong', 'Buahbatu', 'Bandung Wetan', 'Bandung Kulon', 'Bandung Kidul', 'Andir', 'Astanaanyar', 'Babakan Ciparay', 'Batununggal', 'Bojongloa Kaler', 'Bojongloa Kidul', 'Cibeunying Kaler', 'Cibeunying Kidul', 'Cibiru', 'Cidadap', 'Cinambo', 'Gedebage', 'Kiaracondong', 'Mandalajati', 'Panyileukan', 'Rancasari', 'Regol', 'Sukajadi', 'Ujungberung', 'Arcamanik'],
  'Kabupaten Bandung': ['Soreang', 'Banjaran', 'Baleendah', 'Dayeuhkolot', 'Margahayu', 'Katapang', 'Margaasih', 'Kutawaringin', 'Cangkuang', 'Pameungpeuk', 'Cimaung', 'Pangalengan', 'Pasirjambu', 'Ciwidey', 'Rancabali', 'Arjasari', 'Cikancung', 'Cicalengka', 'Nagreg', 'Rancaekek', 'Cileunyi', 'Cimenyan', 'Cilengkrang', 'Bojongsoang', 'Majalaya', 'Solokanjeruk', 'Pacet', 'Kertasari', 'Ibun', 'Paseh', 'Ciparay'],
  'Kota Bekasi': ['Bekasi Timur', 'Bekasi Barat', 'Bekasi Selatan', 'Bekasi Utara', 'Rawa Lumbu', 'Medan Satria', 'Bantar Gebang', 'Pondok Gede', 'Jatiasih', 'Jatisampurna', 'Mustika Jaya', 'Pondok Melati'],
  'Kabupaten Bekasi': ['Cikarang Pusat', 'Cikarang Barat', 'Cikarang Utara', 'Cikarang Selatan', 'Cikarang Timur', 'Tambun Selatan', 'Tambun Utara', 'Cibitung', 'Setu', 'Serang Baru', 'Babelan', 'Tarumajaya', 'Sukawangi', 'Tambelang', 'Sukatani', 'Sukakarya', 'Pebayuran', 'Kedungwaringin', 'Cabangbungin', 'Muaragembong', 'Karangbahagia', 'Cibarusah', 'Bojongmangu'],
  'Kota Bogor': ['Bogor Tengah', 'Bogor Selatan', 'Bogor Utara', 'Bogor Timur', 'Bogor Barat', 'Tanah Sareal'],
  'Kabupaten Bogor': ['Cibinong', 'Citeureup', 'Babakan Madang', 'Ciawi', 'Cisarua', 'Megamendung', 'Caringin', 'Cijeruk', 'Tamansari', 'Ciomas', 'Dramaga', 'Sukajaya', 'Tenjolaya', 'Ciampea', 'Cibungbulang', 'Pamijahan', 'Leuwiliang', 'Leuwisadeng', 'Nanggung', 'Cigudeg', 'Jasinga', 'Rumpin', 'Parungpanjang', 'Tenjo', 'Gunungsindur', 'Kemang', 'Rancabungur', 'Parung', 'Ciseeng', 'Tajurhalang', 'Bojonggede', 'Sukaraja', 'Cileungsi', 'Klapanunggal', 'Gunung Putri', 'Jonggol', 'Sukamakmur', 'Cariu', 'Tanjungsari'],
  'Kota Cimahi': ['Cimahi Utara', 'Cimahi Tengah', 'Cimahi Selatan'],
  'Kabupaten Bandung Barat': ['Ngamprah', 'Padalarang', 'Batujajar', 'Cihampelas', 'Cililin', 'Cipongkor', 'Rongga', 'Gununghalu', 'Sindangkerta', 'Parongpong', 'Lembang', 'Cisarua', 'Cikalongwetan', 'Cipeundeuy', 'Saguling'],
  'Kota Depok': ['Pancoran Mas', 'Sukmajaya', 'Beji', 'Cimanggis', 'Cinere', 'Limo', 'Sawangan', 'Bojongsari', 'Cipayung', 'Cilodong', 'Tapos'],
  'Kota Cirebon': ['Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Harjamukti', 'Pekalipan'],
  'Kabupaten Cirebon': ['Sumber', 'Kedawung', 'Weru', 'Plumbon', 'Palimanan', 'Klangenan', 'Arjawinangun', 'Panguragan', 'Ciweiringin', 'Gempol', 'Susukan', 'Gegesik', 'Kaliwedi', 'Kapetakan', 'Suranenggala', 'Gunung Jati', 'Tengahtani', 'Talun', 'Dukupuntang', 'Beber', 'Greged', 'Sedong', 'Lemahabang', 'Astanajapura', 'Pangenan', 'Mundu', 'Karangsembung', 'Karangwareng', 'Babakan', 'Waled', 'Ciledug', 'Losari', 'Pabedilan', 'Gebang'],
  'Kota Sukabumi': ['Cikole', 'Citamiang', 'Warudoyong', 'Baros', 'Lembursitu', 'Cibeureum', 'Gunungpuyuh'],
  'Kabupaten Sukabumi': ['Palabuhanratu', 'Cibadak', 'Cisaat', 'Cicurug', 'Parungkuda', 'Cikembar', 'Warungkiara', 'Bantargadung', 'Simpenan', 'Ciemas', 'Ciracap', 'Surade', 'Jampangkulon', 'Sagaranten', 'Nyalindung', 'Jampangtengah', 'Purabaya', 'Curugkembar', 'Cidadap', 'Cidolog', 'Kalibunder', 'Cisolok', 'Cikakak', 'Kabandungan', 'Kalapanunggal', 'Bojonggenteng', 'Parakansalak', 'Cidahu', 'Nagrak', 'Ciambar', 'Caringin', 'Kadudampit', 'Sukabumi', 'Sukaraja', 'Kebonpedes', 'Cireunghas', 'Sukalarang', 'Gegerbitung'],
  'Kota Tasikmalaya': ['Cihideung', 'Cipedes', 'Tawang', 'Indihiang', 'Kawalu', 'Cibeureum', 'Tamansari', 'Mangkubumi', 'Bungursari', 'Purbaratu'],
  'Kabupaten Tasikmalaya': ['Singaparna', 'Leuwisari', 'Padakembang', 'Sukaratu', 'Cisayong', 'Sukahening', 'Rajapolah', 'Jamanis', 'Ciawi', 'Kadipaten', 'Pagerageung', 'Sukaresik', 'Mangunreja', 'Sukarame', 'Cigalontang', 'Salawu', 'Taraju', 'Sodonghilir', 'Bojonggambir', 'Culamega', 'Bantarkalong', 'Cipatujah', 'Karangnunggal', 'Cibalong', 'Cikatomas', 'Pancatengah', 'Salopa', 'Jatiwaras', 'Cineam', 'Karangjaya', 'Manonjaya', 'Gunungtanjung'],
  'Kota Banjar': ['Banjar', 'Pataruman', 'Purwaharja', 'Langensari'],
  'Kabupaten Ciamis': ['Ciamis', 'Baregbeg', 'Cikoneng', 'Sindangkasih', 'Cihaurbeuti', 'Sadananya', 'Kawali', 'Panawangan', 'Panjalu', 'Sukamantri', 'Panumbangan', 'Rajadesa', 'Jatinagara', 'Rancah', 'Tambaksari', 'Cisaga', 'Banjaranyar', 'Banjarsari', 'Lakbok', 'Purwadadi', 'Pamarican', 'Cidolog', 'Cimaragas'],
  'Kabupaten Pangandaran': ['Pangandaran', 'Parigi', 'Cijulang', 'Cimerak', 'Cigugur', 'Langkaplancar', 'Mangunjaya', 'Padaherang', 'Kalipucang', 'Sidamulih'],
  'Kabupaten Garut': ['Garut Kota', 'Tarogong Kidul', 'Tarogong Kaler', 'Samarang', 'Pasirwangi', 'Leles', 'Kadungora', 'Cangkuang', 'Karangpawitan', 'Wanaraja', 'Pangatikan', 'Sukawening', 'Karangtengah', 'Banyuresmi', 'Cibatu', 'Kersamanah', 'Malangbong', 'Balubur Limbangan', 'Selaawi', 'Cilawu', 'Bayongbong', 'Cigedug', 'Cikajang', 'Banjaran', 'Singajaya', 'Peundeuy', 'Cihurip', 'Cisompet', 'Pameungpeuk', 'Cibalong', 'Cikelet', 'Bungbulang', 'Mekarmukti', 'Pakenjeng', 'Pamulihan', 'Cisewu', 'Caringin', 'Talegong'],
  'Kabupaten Cianjur': ['Cianjur', 'Karangtengah', 'Mande', 'Sukaluyu', 'Ciranjang', 'Bojongpicung', 'Haurwangi', 'Sukaresmi', 'Cipanas', 'Pacet', 'Cugenang', 'Cikalongkulon', 'Warungkondang', 'Gekbrong', 'Cilaku', 'Cibeber', 'Campaka', 'Campakamulya', 'Sukanagara', 'Pagelaran', 'Pasirkuda', 'Tanggeung', 'Cibinong', 'Sindangbarang', 'Agrabinta', 'Leles', 'Cidaun', 'Naringgul'],
  'Kabupaten Indramayu': ['Indramayu', 'Sindang', 'Pasekan', 'Cantigi', 'Arahan', 'Lohbener', 'Balongan', 'Juntinyuat', 'Karangampel', 'Kedokan Bunder', 'Krangkeng', 'Jatibarang', 'Widasari', 'Kertasemaya', 'Sukagumiwang', 'Tukdana', 'Bangodua', 'Cikedung', 'Terisi', 'Lelea', 'Losarang', 'Kandanghaur', 'Gabuswetan', 'Kroya', 'Bongas', 'Anjatan', 'Sukra', 'Patrol', 'Haurgeulis', 'Gantar'],
  'Kabupaten Karawang': ['Karawang Barat', 'Karawang Timur', 'Telukjambe Timur', 'Telukjambe Barat', 'Klari', 'Cikampek', 'Purwasari', 'Kotabaru', 'Jatisari', 'Banyusari', 'Cilamaya Wetan', 'Cilamaya Kulon', 'Lemahabang', 'Tempuran', 'Majalaya', 'Rawamerta', 'Rengasdengklok', 'Kutawaluya', 'Jayakerta', 'Pedis', 'Cibuaya', 'Batujaya', 'Pakisjaya', 'Tirtajaya', 'Tirtamulya', 'Pangkalan', 'Tegalwaru', 'Ciampel'],
  'Kabupaten Kuningan': ['Kuningan', 'Cigugur', 'Kramatmulya', 'Jalaksana', 'Cilimus', 'Mandirancan', 'Pasawahan', 'Pancalang', 'Japara', 'Cigandamekar', 'Sindangagung', 'Garawangi', 'Ciniru', 'Hantara', 'Maleber', 'Lebakwangi', 'Kalimanggis', 'Ciawigebang', 'Cidahu', 'Cipicung', 'Luragung', 'Cimahi', 'Ciwaru', 'Karangkancana', 'Cibeureum', 'Cibingbin', 'Selajambe', 'Subang', 'Cilebak', 'Darma', 'Kadugede', 'Nusaherang'],
  'Kabupaten Majalengka': ['Majalengka', 'Cigasong', 'Panyingkiran', 'Kadipaten', 'Kertajati', 'Jatitujuh', 'Ligung', 'Sumberjaya', 'Dawuan', 'Kasokandel', 'Palasah', 'Jatiwangi', 'Sukahaji', 'Sindang', 'Rajagaluh', 'Sindangwangi', 'Leuwimunding', 'Argapura', 'Maja', 'Bantarujeg', 'Cikijing', 'Cingambul', 'Talaga', 'Malausma', 'Lemahsugih', 'Banjaran'],
  'Kabupaten Purwakarta': ['Purwakarta', 'Campaka', 'Jatiluhur', 'Plered', 'Sukatani', 'Darangdan', 'Maniis', 'Tegalwaru', 'Pasawahan', 'Babakancikao', 'Bungursari', 'Cibatu', 'Kiarapedes', 'Bojong', 'Wanayasa', 'Pondoksalam', 'Sukadami'],
  'Kabupaten Subang': ['Subang', 'Kalijati', 'Dawuan', 'Cipeundeuy', 'Pabuaran', 'Patokbeusi', 'Purwadadi', 'Pagaden', 'Pagaden Barat', 'Cipunagara', 'Compreng', 'Binong', 'Tambakdahan', 'Cikaum', 'Pusakanagara', 'Pusakaratu', 'Pamanukan', 'Sukasari', 'Legonkulon', 'Blanakan', 'Cibogo', 'Cijambe', 'Jalan Cagak', 'Ciater', 'Kasomalang', 'Sisubang', 'Tanjungsiang', 'Serangpanjang'],
  'Kabupaten Sumedang': ['Sumedang Utara', 'Sumedang Selatan', 'Cimalaka', 'Cisarua', 'Tanjungkerta', 'Tanjungmedar', 'Buahdua', 'Surian', 'Tomo', 'Ujungjaya', 'Jatigede', 'Jatinunggal', 'Wado', 'Cibugel', 'Darmaraja', 'Situraja', 'Cisitu', 'Ganeas', 'Paseh', 'Conggeang', 'Sukamantri', 'Pamulihan', 'Rancakalong', 'Jatinangor', 'Cimanggung', 'Tanjungsari'],

  // --- DKI JAKARTA ---
  'Kota Jakarta Selatan': ['Kebayoran Baru', 'Kebayoran Lama', 'Cilandak', 'Pasar Minggu', 'Tebet', 'Setiabudi', 'Mampang Prapatan', 'Pancoran', 'Jagakarsa', 'Pesanggrahan'],
  'Kota Jakarta Pusat': ['Menteng', 'Gambir', 'Tanah Abang', 'Senen', 'Cempaka Putih', 'Kemayoran', 'Sawah Besar', 'Johar Baru'],
  'Kota Jakarta Barat': ['Grogol Petamburan', 'Kebon Jeruk', 'Kembangan', 'Palmerah', 'Cengkareng', 'Kalideres', 'Tambora', 'Taman Sari'],
  'Kota Jakarta Timur': ['Matraman', 'Pulo Gadung', 'Jatinegara', 'Duren Sawit', 'Kramat Jati', 'Pasar Rebo', 'Ciracas', 'Cipayung', 'Cakung', 'Makasar'],
  'Kota Jakarta Utara': ['Penjaringan', 'Tanjung Priok', 'Kelapa Gading', 'Pademangan', 'Koja', 'Cilincing'],
  'Kabupaten Kepulauan Seribu': ['Kepulauan Seribu Selatan', 'Kepulauan Seribu Utara'],

  // --- BANTEN ---
  'Kota Tangerang': ['Tangerang', 'Batuceper', 'Benda', 'Cibodas', 'Ciledug', 'Cipondoh', 'Jatiuwung', 'Karangtengah', 'Karawaci', 'Larangan', 'Neglasari', 'Periuk', 'Pinang'],
  'Kota Tangerang Selatan': ['Serpong', 'Serpong Utara', 'Pondok Aren', 'Ciputat', 'Ciputat Timur', 'Pamulang', 'Setu'],
  'Kota Serang': ['Serang', 'Cipocok Jaya', 'Curug', 'Kasemen', 'Taktakan', 'Walantaka'],
  'Kota Cilegon': ['Cibeber', 'Cilegon', 'Citangkil', 'Ciwandan', 'Gerogol', 'Jombang', 'Pulomerak', 'Purwakarta'],
  'Kabupaten Tangerang': ['Tigaraksa', 'Balaraja', 'Cikupa', 'Curug', 'Kelapa Dua', 'Legok', 'Pagedangan', 'Panongan', 'Pasarkemis', 'Sepatan', 'Sepatan Timur', 'Rajeg', 'Sindang Jaya', 'Solear', 'Sukadiri', 'Sukamulya', 'Teluknaga', 'Kosambi', 'Pakuhaji', 'Mauk', 'Kronjo', 'Kresek', 'Gunung Kaler', 'Kemiri', 'Jayanti', 'Jambe', 'Cisauk', 'Cisoka'],
  'Kabupaten Serang': ['Kragilan', 'Ciruas', 'Kramatwatu', 'Cikande', 'Kibin', 'Baros', 'Cikeusal', 'Petir', 'Pontang', 'Tirtayasa', 'Tanara', 'Pamarayan', 'Jawilan', 'Kopo', 'Anyar', 'Cinangka', 'Padarincang', 'Ciomas', 'Mancak', 'Waringinkurung', 'Bandung', 'Binuang', 'Carenang', 'Gunung Sari', 'Lebak Wangi', 'Pabuaran', 'Boonegara', 'Pulo Ampel'],
  'Kabupaten Pandeglang': ['Pandeglang', 'Majasari', 'Kaduhejo', 'Cadasari', 'Karangtanjung', 'Menes', 'Jiput', 'Labuan', 'Carita', 'Panimbang', 'Sobang', 'Cigeulis', 'Cibaliung', 'Sumur', 'Munjul', 'Pagelaran', 'Saketi', 'Bojong', 'Picung', 'Sindangresmi'],
  'Kabupaten Lebak': ['Rangkasbitung', 'Kalanganyar', 'Cibadak', 'Warunggunung', 'Cikulur', 'Cileles', 'Gunungkencana', 'Bojongmanik', 'Leuwidamar', 'Cirinten', 'Muncang', 'Sobang', 'Cipanas', 'Lebakgedong', 'Sajira', 'Curugbitung', 'Maja', 'Bayah', 'Cilograng', 'Cibeber', 'Panggarangan', 'Cihara', 'Wanasalam', 'Malingping', 'Cijaku', 'Banjarsari'],

  // --- JAWA TENGAH ---
  'Kota Semarang': ['Semarang Tengah', 'Semarang Barat', 'Semarang Selatan', 'Semarang Timur', 'Semarang Utara', 'Banyumanik', 'Pedurungan', 'Genuk', 'Gayamsari', 'Candisari', 'Gajahmungkur', 'Ngaliyan', 'Mijen', 'Gunungpati', 'Tugu', 'Tembalang'],
  'Kota Surakarta (Solo)': ['Banjarsari', 'Laweyan', 'Jebres', 'Pasar Kliwon', 'Serengan'],
  'Kota Magelang': ['Magelang Utara', 'Magelang Tengah', 'Magelang Selatan'],
  'Kota Pekalongan': ['Pekalongan Barat', 'Pekalongan Timur', 'Pekalongan Utara', 'Pekalongan Selatan'],
  'Kota Salatiga': ['Sidorejo', 'Tingkir', 'Argomulyo', 'Sidomukti'],
  'Kota Tegal': ['Tegal Barat', 'Tegal Timur', 'Tegal Selatan', 'Margadana'],
  'Kabupaten Banyumas (Purwokerto)': ['Purwokerto Timur', 'Purwokerto Barat', 'Purwokerto Selatan', 'Purwokerto Utara', 'Baturraden', 'Sokaraja', 'Kembaran', 'Sumbang', 'Kedungbanteng', 'Karanglewas', 'Cilongok', 'Ajibarang', 'Pekuncen', 'Gumelar', 'Wangon', 'Jatilawang', 'Rawalo', 'Kebasen', 'Patikraja', 'Kalibagor', 'Banyumas', 'Somagede', 'Tambak', 'Sumpiuh', 'Kemranjen'],
  'Kabupaten Cilacap': ['Cilacap Tengah', 'Cilacap Selatan', 'Cilacap Utara', 'Kesugihan', 'Adipala', 'Kroya', 'Nusawungu', 'Binangun', 'Maos', 'Sampang', 'Jeruklegi', 'Kawunganten', 'Gandrungmangu', 'Sidareja', 'Karangpucung', 'Cimanggu', 'Majenang', 'Wanareja', 'Dayeuhluhur', 'Cipari', 'Kedungreja', 'Patimuan', 'Bantarsari', 'Kampung Laut'],
  'Kabupaten Kudus': ['Kota Kudus', 'Jati', 'Gebog', 'Kaliwungu', 'Bae', 'Mejobo', 'Dawe', 'Undaan', 'Jekulo'],
  'Kabupaten Jepara': ['Jepara', 'Tahunan', 'Kedung', 'Pecangaan', 'Kalinyamatan', 'Batealit', 'Mlonggo', 'Pakis Aji', 'Bangsri', 'Kembang', 'Keling', 'Donorojo', 'Welahan', 'Mayong', 'Nalumsari', 'Karimunjawa'],
  'Kabupaten Klaten': ['Klaten Utara', 'Klaten Tengah', 'Klaten Selatan', 'Delanggu', 'Ceper', 'Pedan', 'Juwiring', 'Wonosari', 'Karangdowo', 'Trucuk', 'Kalikotes', 'Ngawen', 'Jatinom', 'Karanganom', 'Tulung', 'Polanharjo', 'Cawas', 'Bayat', 'Wedi', 'Gantiwarno', 'Jogonalan', 'Manisrenggo', 'Prambanan', 'Kemalang'],
  'Kabupaten Sukoharjo': ['Sukoharjo', 'Kartasura', 'Grogol', 'Baki', 'Mojolaban', 'Gatak', 'Polokarto', 'Bendosari', 'Nguter', 'Bulu', 'Weru', 'Tawangsari'],
  'Kabupaten Karanganyar': ['Karanganyar', 'Jaten', 'Colomadu', 'Gondangrejo', 'Kebakkramat', 'Tasikmadu', 'Mojogedang', 'Karangpandan', 'Matesih', 'Tawangmangu', 'Ngargoyoso', 'Jenawi', 'Kerjo', 'Jumapolo', 'Jumantono', 'Jatipuro', 'Jatirejo'],
  'Kabupaten Boyolali': ['Boyolali', 'Mojosongo', 'Ampel', 'Gladagsari', 'Cepogo', 'Selo', 'Musuk', 'Tamansari', 'Teras', 'Banyudono', 'Sawit', 'Ngemplak', 'Nogosari', 'Simo', 'Karanggede', 'Klego', 'Andong', 'Kemusu', 'Wonosegoro', 'Wonosamodro', 'Juwangi'],
  'Kabupaten Brebes': ['Brebes', 'Jatibarang', 'Wanasari', 'Songgom', 'Larangan', 'Bulakamba', 'Tanjung', 'Losari', 'Kersana', 'Ketanggungan', 'Banjarharjo', 'Salem', 'Bantarkawung', 'Bumiayu', 'Paguyangan', 'Sirampog', 'Tonjong'],
  'Kabupaten Tegal': ['Slawi', 'Adiwerna', 'Dukuhturi', 'Talang', 'Tarub', 'Kramat', 'Suradadi', 'Warureja', 'Lebaksiu', 'Balapulang', 'Pangkah', 'Kedungbanteng', 'Jatinegara', 'Pagerbarang', 'Margasari', 'Bumijawa', 'Bojong', 'Dukuhwaru'],
  'Kabupaten Pati': ['Pati', 'Margorejo', 'Gabus', 'Juwana', 'Batangan', 'Jakenan', 'Jaken', 'Winong', 'Pucakwangi', 'Kayen', 'Tambakromo', 'Sukolilo', 'Gembong', 'Tlogowungu', 'Wedarijaksa', 'Trangkil', 'Margoyoso', 'Gunungwungkal', 'Cluwak', 'Tayu', 'Dukuhseti'],
  'Kabupaten Demak': ['Demak', 'Sayung', 'Karangtengah', 'Bonang', 'Wedung', 'Mijen', 'Gajah', 'Karanganyar', 'Dempet', 'Wonosalam', 'Kebonagung', 'Guntur', 'Mranggen', 'Karangawen'],
  'Kabupaten Kebumen': ['Kebumen', 'Pejagoan', 'Alian', 'Klirong', 'Buluspesantren', 'Ambal', 'Mirit', 'Prembun', 'Kutowinangun', 'Poncowarno', 'Sadang', 'Karangsambung', 'Sruweng', 'Petanahan', 'Puring', 'Kuwarasan', 'Adimulyo', 'Gombong', 'Karanganyar', 'Rowokele', 'Buayan', 'Ayah', 'Sempor', 'Padureso', 'Bonorowo'],
  'Kabupaten Kendal': ['Kendal', 'Patebon', 'Cepiring', 'Gemuh', 'Ringinarum', 'Weleri', 'Rowosari', 'Kangkung', 'Brangsong', 'Kaliwungu', 'Kaliwungu Selatan', 'Pegandon', 'Ngampel', 'Patean', 'Singorojo', 'Boja', 'Limbangan', 'Sukorejo', 'Plantungan', 'Pageruyung'],

  // --- DI YOGYAKARTA ---
  'Kota Yogyakarta': ['Danurejan', 'Gedongtengen', 'Gondokusuman', 'Gondomanan', 'Jetis', 'Kotagede', 'Kraton', 'Mantrijeron', 'Mergangsan', 'Ngampilan', 'Pakualaman', 'Tegalrejo', 'Umbulharjo', 'Wirobrajan'],
  'Kabupaten Sleman': ['Depok', 'Mlati', 'Gamping', 'Godean', 'Ngaglik', 'Sleman', 'Kalasan', 'Berbah', 'Prambanan', 'Ngemplak', 'Pakem', 'Cangkringan', 'Turi', 'Tempel', 'Seyegan', 'Minggir', 'Moyudan'],
  'Kabupaten Bantul': ['Bantul', 'Sewon', 'Kasihan', 'Banguntapan', 'Piyungan', 'Pleret', 'Imogiri', 'Dlingo', 'Pundong', 'Bambanglipuro', 'Kretek', 'Sanden', 'Srandakan', 'Pandak', 'Pajangan', 'Sedayu', 'Jetis'],
  'Kabupaten Kulon Progo': ['Wates', 'Pengasih', 'Sentolo', 'Temon', 'Panjatan', 'Galur', 'Lendah', 'Nanggulan', 'Kalibawang', 'Samigaluh', 'Girimulyo', 'Kokap'],
  'Kabupaten Gunungkidul': ['Wonosari', 'Playen', 'Patuk', 'Gedangsari', 'Nglipar', 'Ngawen', 'Semin', 'Ponjong', 'Karangmojo', 'Semanu', 'Rongkop', 'Girisubo', 'Tepus', 'Tanjungsari', 'Panggang', 'Purwosari', 'Paliyan', 'Saptosari'],

  // --- JAWA TIMUR ---
  'Kota Surabaya': ['Gubeng', 'Wonokromo', 'Tegalsari', 'Rungkut', 'Genteng', 'Sukolilo', 'Wiyung', 'Sambikerep', 'Dukuh Pakis', 'Sawahan', 'Wonocolo', 'Tandes', 'Krembangan', 'Pabean Cantikan', 'Semampir', 'Kenjeran', 'Tambaksari', 'Simokerto', 'Bubutan', 'Asemrowo', 'Benowo', 'Pakal', 'Lakarsantri', 'Karangpilang', 'Jambangan', 'Gayungan', 'Tenggilis Mejoyo', 'Gunung Anyar', 'Mulyorejo', 'Bulak', 'Sukomanunggal'],
  'Kota Malang': ['Klojen', 'Blimbing', 'Lowokwaru', 'Sukun', 'Kedungkandang'],
  'Kota Batu': ['Batu', 'Bumiaji', 'Junrejo'],
  'Kota Pasuruan': ['Panggungrejo', 'Purworejo', 'Bugul Kidul', 'Gadingrejo'],
  'Kota Mojokerto': ['Magersari', 'Prajurit Kulon', 'Krガンgan'],
  'Kota Kediri': ['Kota', 'Mojoroto', 'Pesantren'],
  'Kota Blitar': ['Kepanjenkidul', 'Sukorejo', 'Sananwetan'],
  'Kota Madiun': ['Kartoharjo', 'Manguharjo', 'Taman'],
  'Kota Probolinggo': ['Kanigaran', 'Mayangan', 'Kademangan', 'Wonoasih', 'Kedopok'],
  'Kabupaten Sidoarjo': ['Sidoarjo', 'Waru', 'Taman', 'Gedangan', 'Sedati', 'Buduran', 'Candi', 'Tanggungharjo', 'Porong', 'Jabon', 'Krembung', 'Tulangan', 'Prambon', 'Tarik', 'Balongbendo', 'Krian', 'Wonoayu', 'Sukodono'],
  'Kabupaten Gresik': ['Gresik', 'Kebomas', 'Manyar', 'Driyorejo', 'Menganti', 'Cerme', 'Benjeng', 'Balongpanggang', 'Kedamean', 'Wringinanom', 'Duduksampeyan', 'Bungah', 'Sidayu', 'Dukun', 'Panceng', 'Ujungpangkah', 'Sangkapura', 'Tambak'],
  'Kabupaten Malang': ['Kepanjen', 'Singosari', 'Lawang', 'Pakis', 'Tumpang', 'Poncokusumo', 'Jabung', 'Wagir', 'Dau', 'Karangploso', 'Pujon', 'Ngantang', 'Kasembon', 'Tajinan', 'Bululawang', 'Gondanglegi', 'Pagelaran', 'Turen', 'Dampit', 'Tirtoyudo', 'Ampelgading', 'Sumbermanjing Wetan', 'Gedangan', 'Bantur', 'Pagak', 'Donomulyo', 'Kalipare', 'Sumberpucung', 'Kromengan', 'Ngajum', 'Wonosari'],
  'Kabupaten Jember': ['Kaliwates', 'Sumbersari', 'Patrang', 'Arjasa', 'Pakusari', 'Sukowono', 'Kalisat', 'Ledokombo', 'Sumberjambe', 'Silo', 'Mayang', 'Mumbulsari', 'Tempurejo', 'Rambipuji', 'Balung', 'Wuluhan', 'Puger', 'Gumukmas', 'Kencong', 'Jombang', 'Umbulsari', 'Semboro', 'Tanggul', 'Bangsalsari', 'Panti', 'Sukorambi', 'Jenggawah', 'Ajung'],
  'Kabupaten Banyuwangi': ['Banyuwangi', 'Giri', 'Kalipuro', 'Glagah', 'Licin', 'Songgon', 'Rogojampi', 'Blimbingsari', 'Kabat', 'Singojuruh', 'Srono', 'Cluring', 'Gambiran', 'Tegalsari', 'Genteng', 'Glenmore', 'Kalibaru', 'Pesanggaran', 'Siliragung', 'Bangorejo', 'Purwoharjo', 'Tegaldlimo', 'Muncar', 'Wongsorejo'],
  'Kabupaten Pasuruan': ['Bangil', 'Beji', 'Gempol', 'Pandaan', 'Prigen', 'Sukorejo', 'Purwosari', 'Wonorejo', 'Purwodadi', 'Tutur', 'Puspo', 'Tosari', 'Lumbang', 'Pasrepan', 'Kejayan', 'Kraton', 'Pohjentrek', 'Gondangwetan', 'Rejoso', 'Winongan', 'Grati', 'Nguling', 'Lekok'],
  'Kabupaten Mojokerto': ['Mojosari', 'Puri', 'Sooko', 'Bangsal', 'Dlanggu', 'Kutorejo', 'Pungging', 'Ngoro', 'Trawas', 'Pacet', 'Gondang', 'Jatirejo', 'Trowulan', 'Kemlagi', 'Gedeg', 'Jetis', 'Dawarblandong'],
  'Kabupaten Bojonegoro': ['Bojonegoro', 'Kapas', 'Balen', 'Sumberejo', 'Baureno', 'Kanor', 'Kepohbaru', 'Kedungadem', 'Sugihwaras', 'Sukosewu', 'Dander', 'Temayang', 'Bubulan', 'Gondang', 'Sekar', 'Ngasem', 'Gayam', 'Kalitidu', 'Malo', 'Trucuk', 'Purwosari', 'Padangan', 'Kasiman', 'Kedewan', 'Tambakrejo', 'Ngambon', 'Margomulyo'],

  // --- BALI ---
  'Kota Denpasar': ['Denpasar Barat', 'Denpasar Timur', 'Denpasar Selatan', 'Denpasar Utara'],
  'Kabupaten Badung': ['Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi', 'Abiansemal', 'Petang'],
  'Kabupaten Gianyar': ['Gianyar', 'Ubud', 'Sukawati', 'Blahbatuh', 'Tegallalang', 'Tampaksiring', 'Payangan'],
  'Kabupaten Tabanan': ['Tabanan', 'Kediri', 'Kerambitan', 'Selemadeg', 'Selemadeg Timur', 'Selemadeg Barat', 'Penebel', 'Pupuan', 'Baturiti', 'Marga'],
  'Kabupaten Buleleng': ['Buleleng', 'Sukasada', 'Banjar', 'Seririt', 'Gerokgak', 'Kubutambahan', 'Sawan', 'Tejakula', 'Busungbiu'],
  'Kabupaten Karangasem': ['Karangasem', 'Manggis', 'Rendang', 'Bebandem', 'Abang', 'Kubu', 'Selat', 'Sidemen'],
  'Kabupaten Klungkung': ['Klungkung', 'Banjarangkan', 'Dawan', 'Nusa Penida'],
  'Kabupaten Bangli': ['Bangli', 'Susut', 'Tembuku', 'Kintamani'],
  'Kabupaten Jembrana': ['Negara', 'Jembrana', 'Mendoyo', 'Pekutatan', 'Melaya'],

  // --- SUMATERA UTARA ---
  'Kota Medan': ['Medan Kota', 'Medan Barat', 'Medan Timur', 'Medan Utara', 'Medan Sunggal', 'Medan Helvetia', 'Medan Denai', 'Medan Deli', 'Medan Belawan', 'Medan Labuhan', 'Medan Marelan', 'Medan Baru', 'Medan Petisah', 'Medan Polonia', 'Medan Maimun', 'Medan Area', 'Medan Johor', 'Medan Amplas', 'Medan Tembung', 'Medan Selayang', 'Medan Tuntungan'],
  'Kabupaten Deli Serdang': ['Lubuk Pakam', 'Tanjung Morawa', 'Sunggal', 'Percut Sei Tuan', 'Patumbak', 'Deli Tua', 'Namorambe', 'Sibolangit', 'Pancur Batu', 'Kutalimbaru', 'Hamparan Perak', 'Labuhan Deli', 'Batang Kuis', 'Pantai Labu', 'Beringin', 'Pagar Merbau', 'Galang', 'Bangun Purba', 'Gunung Meriah', 'STM Hilir', 'STM Hulu', 'Biru-Biru'],
  'Kota Binjai': ['Binjai Kota', 'Binjai Barat', 'Binjai Timur', 'Binjai Utara', 'Binjai Selatan'],
  'Kota Pematangsiantar': ['Siantar Barat', 'Siantar Timur', 'Siantar Selatan', 'Siantar Utara', 'Siantar Marihat', 'Siantar Martoba', 'Siantar Sitalasari', 'Siantar Marimbun'],
  'Kabupaten Karo': ['Kabanjahe', 'Berastagi', 'Tigapanah', 'Merek', 'Barusjahe', 'Simpang Empat', 'Naman Teran', 'Payung', 'Tiganderket', 'Kutabuluh', 'Juhar', 'Munte', 'Laubaleng', 'Mardingding'],

  // --- SUMATERA BARAT ---
  'Kota Padang': ['Padang Barat', 'Padang Timur', 'Padang Utara', 'Padang Selatan', 'Koto Tangah', 'Kuranji', 'Lubuk Begalung', 'Lubuk Kilangan', 'Nanggalo', 'Pauh', 'Bungus Teluk Kabung'],
  'Kota Bukittinggi': ['Guguk Panjang', 'Mandiangin Koto Selayan', 'Aur Birugo Tigo Baleh'],
  'Kota Payakumbuh': ['Payakumbuh Barat', 'Payakumbuh Timur', 'Payakumbuh Utara', 'Payakumbuh Selatan', 'Lamposi Tigo Nagori'],
  'Kabupaten Agam': ['Lubuk Basung', 'Tanjung Raya (Maninjau)', 'IV Koto', 'Banuhampu', 'Tilatang Kamang', 'Baso', 'Candung', 'Kamang Magek', 'Matur', 'Palembayan', 'Palupuh', 'Sungai Pua', 'Ampek Angkek'],

  // --- RIAU & KEPULAUAN RIAU ---
  'Kota Pekanbaru': ['Sukajadi', 'Senapelan', 'Pekanbaru Kota', 'Rumbai', 'Rumbai Barat', 'Rumbai Timur', 'Bukit Raya', 'Marpoyan Damai', 'Tampan (Bina Widya)', 'Tuah Madani', 'Payung Sekaki', 'Tenayan Raya', 'Kulim', 'Sail', 'Lima Puluh'],
  'Kota Batam': ['Batam Kota', 'Lubuk Baja', 'Batu Ampar', 'Bengkong', 'Nongsa', 'Sei Beduk', 'Sagulung', 'Batu Aji', 'Sekupang', 'Belakang Padang', 'Bulang', 'Galang'],
  'Kota Tanjungpinang': ['Tanjungpinang Kota', 'Tanjungpinang Barat', 'Tanjungpinang Timur', 'Bukit Bestari'],
  'Kabupaten Kampar': ['Bangkinang Kota', 'Bangkinang', 'Tapung', 'Tapung Hulu', 'Tapung Hilir', 'Tambang', 'Siak Hulu', 'Kampar', 'Kampar Kiri', 'Kampar Utara', 'Kuok', 'XIII Koto Kampar', 'Salo'],

  // --- SUMATERA SELATAN & LAMPUNG ---
  'Kota Palembang': ['Ilir Timur I', 'Ilir Timur II', 'Ilir Timur III', 'Ilir Barat I', 'Ilir Barat II', 'Seberang Ulu I', 'Seberang Ulu II', 'Jakabaring', 'Sukarami', 'Alang-Alang Lebar', 'Kalidoni', 'Sako', 'Sematang Borang', 'Kemuning', 'Plaju', 'Kertapati', 'Gandus', 'Bukit Kecil'],
  'Kota Bandar Lampung': ['Tanjung Karang Pusat', 'Tanjung Karang Barat', 'Tanjung Karang Timur', 'Kedaton', 'Rajabasa', 'Labuhan Ratu', 'Way Halim', 'Sukabumi', 'Sukarame', 'Teluk Betung Selatan', 'Teluk Betung Barat', 'Teluk Betung Utara', 'Teluk Betung Timur', 'Panjang', 'Kemiling', 'Langkapura', 'Enggal', 'Bumi Waras', 'Kedamaian'],
  'Kabupaten Lampung Selatan': ['Kalianda', 'Natar', 'Jati Agung', 'Tanjung Bintang', 'Tanjungsari', 'Sidomulyo', 'Katibung', 'Candipuro', 'Way Sulan', 'Palas', 'Sragi', 'Penengahan', 'Bakauheni', 'Rajabasa', 'Ketapang', 'Merbau Mataram', 'Way Panji'],

  // --- KALIMANTAN ---
  'Kota Banjarmasin': ['Banjarmasin Tengah', 'Banjarmasin Barat', 'Banjarmasin Timur', 'Banjarmasin Selatan', 'Banjarmasin Utara'],
  'Kota Banjarbaru': ['Banjarbaru Utara', 'Banjarbaru Selatan', 'Landasan Ulin', 'Cempaka', 'Liang Anggang'],
  'Kota Samarinda': ['Samarinda Kota', 'Samarinda Ulu', 'Samarinda Ilir', 'Samarinda Seberang', 'Samarinda Utara', 'Sungai Kunjang', 'Sungai Pinang', 'Palaran', 'Sambutan', 'Loa Janan Ilir'],
  'Kota Balikpapan': ['Balikpapan Kota', 'Balikpapan Selatan', 'Balikpapan Timur', 'Balikpapan Utara', 'Balikpapan Barat', 'Balikpapan Tengah'],
  'Kota Pontianak': ['Pontianak Kota', 'Pontianak Barat', 'Pontianak Selatan', 'Pontianak Tenggara', 'Pontianak Timur', 'Pontianak Utara'],
  'Kota Palangka Raya': ['Pahandut', 'Jekan Raya', 'Bukit Batu', 'Sebangau', 'Rakumpit'],

  // --- SULAWESI ---
  'Kota Makassar': ['Ujung Pandang', 'Makassar', 'Mariso', 'Mamajang', 'Bontoala', 'Wajo', 'Tallo', 'Panakkukang', 'Rappocini', 'Tamalate', 'Manggala', 'Biringkanaya', 'Tamalanrea', 'Kepulauan Sangkarrang'],
  'Kabupaten Gowa': ['Somba Opu', 'Pallangga', 'Bontomarannu', 'Bajeng', 'Bajeng Barat', 'Barombong', 'Pattallassang', 'Parangloe', 'Manuju', 'Tinggimoncong (Malino)', 'Tombolo Pao', 'Bontolempangan', 'Biringbulu', 'Tompobulu'],
  'Kota Manado': ['Wenang', 'Sario', 'Malalayang', 'Wanea', 'Tikala', 'Paal Dua', 'Mapanget', 'Singkil', 'Tuminting', 'Bunaken', 'Bunaken Kepulauan'],
  'Kota Palu': ['Palu Barat', 'Palu Timur', 'Palu Selatan', 'Palu Utara', 'Tatanga', 'Ulujadi', 'Mantikulore', 'Tawaeli'],
  'Kota Kendari': ['Kendari', 'Kendari Barat', 'Mandonga', 'Baruga', 'Poasia', 'Abeli', 'Wua-Wua', 'Kadia', 'Puuwatu', 'Nambo'],

  // --- PAPUA & MALUKU ---
  'Kota Jayapura': ['Jayapura Utara', 'Jayapura Selatan', 'Abepura', 'Heram', 'Muara Tami'],
  'Kabupaten Mimika (Timika)': ['Mimika Baru', 'Kuala Kencana', 'Tembagapura', 'Iwaka', 'Kwamki Narama', 'Wania', 'Mimika Timur', 'Mimika Barat', 'Agimuga', 'Jila'],
  'Kota Sorong': ['Sorong', 'Sorong Barat', 'Sorong Timur', 'Sorong Utara', 'Sorong Kepulauan', 'Sorong Manoi', 'Sorong Kota', 'Klaurung', 'Malaimsimsa', 'Maladum Mes'],
  'Kota Ambon': ['Sirimau', 'Nusaniwe', 'Teluk Ambon', 'Baguala', 'Leitimur Selatan'],
  'Kota Mataram': ['Mataram', 'Ampenan', 'Cakranegara', 'Sekarbela', 'Selaparang', 'Sandubaya'],
  'Kota Kupang': ['Alak', 'Kelapa Lima', 'Kota Raja', 'Kota Lama', 'Maulafa', 'Oebobo'],
};

// Helper function to get cities for a given province
export const getCitiesForProvince = (provinceName: string): string[] => {
  if (!provinceName) return [];
  const foundInTree = INDONESIA_REGIONS.find(p => p.name.toLowerCase() === provinceName.toLowerCase());
  if (foundInTree && foundInTree.cities.length > 0) {
    const fromTree = foundInTree.cities.map(c => c.name);
    const fromMap = PROVINCE_CITIES_MAP[provinceName] || [];
    // Combine and unique
    return Array.from(new Set([...fromTree, ...fromMap]));
  }
  return PROVINCE_CITIES_MAP[provinceName] || [
    `Kota ${provinceName}`,
    `Kabupaten ${provinceName} Pusat`,
    `Kabupaten ${provinceName} Barat`,
    `Kabupaten ${provinceName} Timur`,
  ];
};

// Helper function to get districts (kecamatan) for a city
export const getDistrictsForCity = (provinceName: string, cityName: string): string[] => {
  if (!cityName) return [];
  
  // 1. Check in detailed nested hierarchy tree
  for (const prov of INDONESIA_REGIONS) {
    const city = prov.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (city && city.districts.length > 0) {
      const fromTree = city.districts.map(d => d.name);
      const fromMap = CITY_DISTRICTS_MAP[cityName] || [];
      return Array.from(new Set([...fromTree, ...fromMap]));
    }
  }

  // 2. Check in CITY_DISTRICTS_MAP with exact or normalized name
  if (CITY_DISTRICTS_MAP[cityName] && CITY_DISTRICTS_MAP[cityName].length > 0) {
    return CITY_DISTRICTS_MAP[cityName];
  }

  // Check without prefix (e.g. 'Kota Bandung' vs 'Bandung')
  const cleanCity = cityName.replace(/^(Kota|Kabupaten)\s+/i, '').trim();
  for (const [key, districts] of Object.entries(CITY_DISTRICTS_MAP)) {
    const cleanKey = key.replace(/^(Kota|Kabupaten)\s+/i, '').trim();
    if (cleanKey.toLowerCase() === cleanCity.toLowerCase() || key.toLowerCase().includes(cleanCity.toLowerCase())) {
      return districts;
    }
  }

  // 3. Fallback smart administrative subdistrict pattern
  return [
    `${cleanCity} Kota`,
    `${cleanCity} Barat`,
    `${cleanCity} Timur`,
    `${cleanCity} Selatan`,
    `${cleanCity} Utara`,
    `${cleanCity} Tengah`,
    `${cleanCity} Baru`,
    `Kecamatan ${cleanCity} 1`,
    `Kecamatan ${cleanCity} 2`,
  ];
};

// Helper function to get villages (desa / kelurahan) for a district
export const getVillagesForDistrict = (provinceName: string, cityName: string, districtName: string): string[] => {
  if (!districtName) return [];
  for (const prov of INDONESIA_REGIONS) {
    for (const city of prov.cities) {
      const dist = city.districts.find(d => d.name.toLowerCase() === districtName.toLowerCase());
      if (dist && dist.villages.length > 0) {
        return dist.villages;
      }
    }
  }

  const cleanDist = districtName.toLowerCase().replace(/^(kecamatan|kec\.)\s+/i, '').trim();
  if (DISTRICT_VILLAGES_OFFLINE[cleanDist]) {
    return DISTRICT_VILLAGES_OFFLINE[cleanDist];
  }

  for (const [key, villages] of Object.entries(DISTRICT_VILLAGES_OFFLINE)) {
    if (key.includes(cleanDist) || cleanDist.includes(key)) {
      return villages;
    }
  }

  return [];
};



