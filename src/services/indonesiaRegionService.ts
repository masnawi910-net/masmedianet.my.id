// Service Wilayah Indonesia (Kemendagri / BPS API + Rich Offline Fallback)

export interface ApiItem {
  id: string;
  name: string;
  province_id?: string;
  regency_id?: string;
  district_id?: string;
}

// Convert uppercase Kemendagri names to clean Title Case
export function toTitleCase(str: string): string {
  if (!str) return '';
  
  // Special acronyms
  const upperMap: Record<string, string> = {
    'DKI': 'DKI',
    'DI': 'DI',
    'IKN': 'IKN',
    'NTB': 'NTB',
    'NTT': 'NTT',
    'NAD': 'NAD',
    'II': 'II',
    'III': 'III',
    'IV': 'IV',
    'VI': 'VI',
    'VII': 'VII',
    'VIII': 'VIII',
    'IX': 'IX',
    'XII': 'XII',
    'XIII': 'XIII',
    'XIV': 'XIV',
    'XV': 'XV',
  };

  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      const up = word.toUpperCase();
      if (upperMap[up]) return upperMap[up];
      if (word.startsWith('(') && word.endsWith(')')) {
        const inner = word.slice(1, -1).toUpperCase();
        if (upperMap[inner]) return `(${upperMap[inner]})`;
        return `(${word.charAt(1).toUpperCase() + word.slice(2, -1)})`;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Memory Cache
const cache = {
  provinces: null as ApiItem[] | null,
  regencies: new Map<string, ApiItem[]>(),
  districts: new Map<string, ApiItem[]>(),
  villages: new Map<string, ApiItem[]>(),
};

// Rich offline dictionary for Villages across Indonesian districts
export const DISTRICT_VILLAGES_OFFLINE: Record<string, string[]> = {
  // --- KOTA BANDUNG ---
  'coblong': ['Dago', 'Lebak Siliwangi', 'Lebakgede', 'Sadang Serang', 'Sekeloa'],
  'sukasari': ['Gegerkalong', 'Isola', 'Sarijadi', 'Sukarasa'],
  'cicendo': ['Arjuna', 'Husen Sastranegara', 'Pajajaran', 'Pamoyanan', 'Pasirkaliki', 'Sukamaju'],
  'sumur bandung': ['Babakan Ciamis', 'Braga', 'Kebon Pisang', 'Merdeka'],
  'lengkong': ['Burangrang', 'Cijagra', 'Cikawao', 'Lingkar Selatan', 'Malabar', 'Paledang', 'Turangga'],
  'buahbatu': ['Cijawura', 'Jatisari', 'Margasari', 'Sekejati'],
  'bandung wetan': ['Cihapit', 'Citarum', 'Tamansari'],
  'andir': ['Campaka', 'Ciroyom', 'Dunguscariang', 'Garuda', 'Kebon Jeruk', 'Maleber'],
  'astanaanyar': ['Cibadak', 'Karanganyar', 'Karasak', 'Nyengseret', 'Panjunan', 'Pelindung Hewan'],
  'babakan ciparay': ['Babakan', 'Babakan Ciparay', 'Cirangrang', 'Margahayu Utara', 'Margasuka', 'Sukahaji'],
  'batununggal': ['Batununggal', 'Gumuruh', 'Kacapiring', 'Kebon Gedang', 'Kebonwaru', 'Maleer', 'Samoja', 'Binong'],
  'bojongloa kaler': ['Babakan Asih', 'Babakan Tarogong', 'Jamika', 'Kopo', 'Suka Asih'],
  'bojongloa kidul': ['Cibaduyut', 'Cibaduyut Kidul', 'Cibaduyut Wetan', 'Kebon Lega', 'Mekarwangi', 'Situsaeur'],
  'cibeunying kaler': ['Cigadung', 'Cihaurgeulis', 'Neglasari', 'Sukaluyu'],
  'cibeunying kidul': ['Cikutra', 'Cicadas', 'Padasuka', 'Pasirlayung', 'Sukamaju', 'Sukapada'],
  'cibiru': ['Cipadung', 'Cisurupan', 'Palasari', 'Pasirbiru'],
  'cidadap': ['Ciumbuleuit', 'Hegarmanah', 'Ledeng'],
  'cinambo': ['Babakan Penghulu', 'Cisaranten Wetan', 'Pakemitan', 'Sukamulya'],
  'gedebage': ['Cimincrang', 'Cisaranten Rancabaya', 'Rancabolang', 'Rancanumpang'],
  'kiaracondong': ['Babakan Surabaya', 'Babakansari', 'Cicaheum', 'Kebonkangkung', 'Kebunjayanti', 'Sukapura'],
  'mandalajati': ['Jatihandap', 'Karangpamulang', 'Pasir Impun', 'Sindangjaya'],
  'panyileukan': ['Cipadung Kidul', 'Cipadung Kulon', 'Cipadung Wetan', 'Mekarmulya'],
  'rancasari': ['Cipamokolan', 'Derwati', 'Manjahlega', 'Mekar Jaya'],
  'regol': ['Ancol', 'Balonggede', 'Ciateul', 'Cigereleng', 'Ciseureuh', 'Pasirluyu', 'Pungkur'],
  'sukajadi': ['Cipedes', 'Pasteur', 'Sukagalih', 'Sukawarna', 'Sukabungah'],
  'ujungberung': ['Cigending', 'Pasanggrahan', 'Pasirendah', 'Pasirwangi', 'Pasirjati'],
  'arcamanik': ['Cisaranten Bina Harapan', 'Cisaranten Endah', 'Cisaranten Kulon', 'Sukamiskin'],
  'bandung kulon': ['Caringin', 'Cibuntu', 'Cigondewah Kaler', 'Cigondewah Kidul', 'Cigondewah Rahayu', 'Cijerah', 'Gempolsari', 'Warung Muncang'],
  'bandung kidul': ['Batununggal', 'Kujangsari', 'Mengger', 'Wates'],

  // --- KABUPATEN BANDUNG ---
  'soreang': ['Cingcin', 'Karamatmulya', 'Pamekaran', 'Panyirapan', 'Sadu', 'Sekarwangi', 'Soreang', 'Sukajadi'],
  'banjaran': ['Banjaran', 'Banjaran Wetan', 'Ciapus', 'Kamasan', 'Kiangroke', 'Margahurip', 'Pasirmulya', 'Sindangpanon', 'Tarajusari'],
  'baleendah': ['Andir', 'Baleendah', 'Bojongmalaka', 'Jelekong', 'Malakasari', 'Manggahang', 'Rancamanyar', 'Wargamekar'],
  'dayeuhkolot': ['Cangkuang Kulon', 'Cangkuang Wetan', 'Citeureup', 'Dayeuhkolot', 'Pasawahan', 'Sukapura'],
  'margahayu': ['Margahayu Selatan', 'Margahayu Tengah', 'Sayati', 'Sukamenak', 'Sulaeman'],
  'bojongsoang': ['Bojongsari', 'Bojongsoang', 'Buahbatu', 'Cipagalo', 'Lengkong', 'Tegalluar'],
  'cileunyi': ['Cileunyi Kulon', 'Cileunyi Wetan', 'Cimekar', 'Cingcin', 'Cinunuk'],
  'rancaekek': ['Bojongloa', 'Bojongsalam', 'Cangkuang', 'Haurpugur', 'Jelegong', 'Linggar', 'Nanjungmekar', 'Rancaekek Kencana', 'Rancaekek Kulon', 'Rancaekek Wetan', 'Sangiang', 'Sukamanah', 'Sukamulya', 'Tegalsumedang'],
  'majalaya': ['Biru', 'Bojong', 'Majakerta', 'Majalaya', 'Majasetra', 'Neglasari', 'Padamulya', 'Paseh', 'Sukamaju', 'Sukamukti', 'Wangisagara'],

  // --- KOTA BEKASI ---
  'bekasi timur': ['Aren Jaya', 'Bekasi Jaya', 'Duren Jaya', 'Margahayu'],
  'bekasi barat': ['Bintara', 'Bintara Jaya', 'Jaka Sampurna', 'Kota Baru', 'Kranji'],
  'bekasi selatan': ['Jaka Mulya', 'Jaka Setia', 'Kayuringin Jaya', 'Mekar Jaya', 'Pekayon Jaya'],
  'bekasi utara': ['Harapan Baru', 'Harapan Jaya', 'Kaliabang Tengah', 'Marga Mulya', 'Perwira', 'Teluk Pucung'],
  'pondok gede': ['Jatibening', 'Jatibening Baru', 'Jaticempaka', 'Jatimakmur', 'Jatiwaringin'],
  'jatiasih': ['Jatiasih', 'Jatikramat', 'Jatiluhur', 'Jatimekar', 'Jatirasa', 'Jatisari'],
  'rawalumbu': ['Bojong Menteng', 'Bojong Rawalumbu', 'Pengasinan', 'Sepanjang Jaya'],
  'medan satria': ['Harapan Mulya', 'Kali Baru', 'Medan Satria', 'Pejuang'],

  // --- KABUPATEN BEKASI ---
  'cikarang pusat': ['Cicau', 'Hegarmukti', 'Jayamukti', 'Pasirranji', 'Pasirtanjung', 'Sukamahi'],
  'cikarang barat': ['Cikedokan', 'Danau Indah', 'Gandamekar', 'Gandasari', 'Jatiwangi', 'Kalijaya', 'Mekarwangi', 'Sukadanau', 'Telaga Asih', 'Telagamurni', 'Telajung'],
  'cikarang utara': ['Cikarangkota', 'Harjamekar', 'Karangasih', 'Karangbaru', 'Karangraharja', 'Mekarmukti', 'Pasirgombong', 'Simpangan', 'Tanjungsari', 'Waluya', 'Wangunharja'],
  'cikarang selatan': ['Ciantra', 'Cibatu', 'Pasirsari', 'Serang', 'Sukadami', 'Sukaresmi', 'Sukasejati'],
  'cikarang timur': ['Cipayung', 'Hegarmanah', 'Jatibaru', 'Jatireja', 'Karangsari', 'Labansari', 'Sertajaya', 'Tanjungsari'],
  'tambun selatan': ['Jatimulya', 'Lambangjaya', 'Lambangsari', 'Mangunjaya', 'Setiadarma', 'Setiamekar', 'Sumberjaya', 'Tambun', 'Tridaya Sakti'],
  'tambun utara': ['Jalenjaya', 'Karangsatria', 'Satria Jaya', 'Satria Mekar', 'Sriamur', 'Srijaya', 'Srimahi', 'Srimukti'],
  'cibitung': ['Cibuntu', 'Kertamukti', 'Muktiwari', 'Sarimukti', 'Sukajaya', 'Wanajaya', 'Wanasari'],

  // --- KOTA BOGOR ---
  'bogor tengah': ['Babakan', 'Babakan Pasar', 'Cibogor', 'Ciwaringin', 'Gudang', 'Kebon Kelapa', 'Pabaton', 'Paledang', 'Panaragan', 'Sempur', 'Tegallega'],
  'bogor selatan': ['Batutulis', 'Bojongkerta', 'Bondongan', 'Cikaret', 'Cipaku', 'Empang', 'Genteng', 'Harjasari', 'Kertamaya', 'Lawanggintung', 'Muarasari', 'Mulyaharja', 'Pakuan', 'Pamoyanan', 'Rancamaya', 'Ranggamekar'],
  'bogor utara': ['Bantarjati', 'Cibuluh', 'Ciluar', 'Cimahpar', 'Ciparigi', 'Kedunghalang', 'Tanah Baru', 'Tegal Gundil'],
  'bogor timur': ['Baranangsiang', 'Katulampa', 'Sindangrasa', 'Sindangbarang', 'Sukasari', 'Tajur'],
  'bogor barat': ['Balumbang Jaya', 'Bubulak', 'Cilendek Barat', 'Cilendek Timur', 'Curug', 'Curugmekar', 'Gunungbatu', 'Loji', 'Margajaya', 'Menteng', 'Pasirjaya', 'Pasirkuda', 'Pasirmulya', 'Semplak', 'Sindangbarang', 'Situgede'],
  'tanah sareal': ['Cibadak', 'Kayumanis', 'Kebon Pedes', 'Kedung Badak', 'Kedung Jaya', 'Kedung Waringin', 'Mekarwangi', 'Sukadamai', 'Sukaresmi', 'Tanah Sareal'],

  // --- KABUPATEN BOGOR ---
  'cibinong': ['Cibinong', 'Cirimekar', 'Ciriung', 'Harapan Jaya', 'Karadenan', 'Nanggewer', 'Nanggewer Mekar', 'Pabuaran', 'Pabuaran Mekar', 'Pakansari', 'Pondok Rajeg', 'Sukahati', 'Tengah'],
  'citeureup': ['Citeureup', 'Gunung Sari', 'Hambalang', 'Karang Asem Barat', 'Karang Asem Timur', 'Leuwinutug', 'Pasir Mukti', 'Puspanegara', 'Puspasari', 'Sanja', 'Sukahati', 'Tajur', 'Tangkil'],
  'babakan madang': ['Babakan Madang', 'Bojong Koneng', 'Cadas Ngampar', 'Cijayanti', 'Cipambuan', 'Citaringgul', 'Kadumangu', 'Karang Tengah', 'Sentul', 'Sumur Batu'],
  'ciawi': ['Banjar Sari', 'Banjar Wangi', 'Bitung Sari', 'Bojong Murni', 'Ciawi', 'Cibedug', 'Cileungsi', 'Citapen', 'Jambu Luwuk', 'Pandansari', 'Teluk Pinang'],
  'cisarua': ['Batu Layang', 'Cibeureum', 'Cilember', 'Cisarua', 'Citeko', 'Jogjogan', 'Kopo', 'Leuwimalang', 'Tugu Selatan', 'Tugu Utara'],
  'gunung putri': ['Bojong Kulur', 'Bojong Nangka', 'Cicadas', 'Cikeas Udik', 'Gunung Putri', 'Karanggan', 'Nagrak', 'Tlajung Udik', 'Wanaherang'],
  'cileungsi': ['Cileungsi', 'Cileungsi Kidul', 'Cipenjo', 'Cipeucang', 'Dayeuh', 'Gandoang', 'Jatisari', 'Limus Nunggal', 'Mekarsari', 'Pasir Angin', 'Setu Sari'],

  // --- KOTA DEPOK ---
  'pancoran mas': ['Depok', 'Depok Jaya', 'Mampang', 'Pancoran Mas', 'Rangkapan Jaya', 'Rangkapan Jaya Baru'],
  'sukmajaya': ['Abadijaya', 'Bakti Jaya', 'Cisalak', 'Mekar Jaya', 'Sukmajaya', 'Tirtajaya'],
  'beji': ['Beji', 'Beji Timur', 'Kemirimuka', 'Kukusan', 'Pondok Cina', 'Tanah Baru'],
  'cimanggis': ['Curug', 'Harjamukti', 'Cisalak Pasar', 'Mekarsari', 'Pasir Gunung Selatan', 'Tugu'],
  'cinere': ['Cinere', 'Gandul', 'Pangkalan Jati', 'Pangkalan Jati Baru'],
  'sawangan': ['Bedahan', 'Cinangka', 'Kedaung', 'Pasir Putih', 'Pengasinan', 'Sawangan', 'Sawangan Baru'],

  // --- DKI JAKARTA ---
  'kebayoran baru': ['Selong', 'Gunung', 'Kramat Pela', 'Gandaria Utara', 'Cipete Utara', 'Pulo', 'Melawai', 'Petogogan', 'Rawa Barat', 'Senayan'],
  'kebayoran lama': ['Grogol Utara', 'Grogol Selatan', 'Cipulir', 'Kebayoran Lama Utara', 'Kebayoran Lama Selatan', 'Pondok Pinang'],
  'cilandak': ['Cipete Selatan', 'Gandaria Selatan', 'Cilandak Barat', 'Lebak Bulus', 'Pondok Labu'],
  'pasar minggu': ['Pejaten Barat', 'Pejaten Timur', 'Pasar Minggu', 'Kebagusan', 'Jati Padang', 'Ragunan', 'Cilandak Timur'],
  'tebet': ['Tebet Barat', 'Tebet Timur', 'Kebon Baru', 'Bukit Duri', 'Manggarai', 'Manggarai Selatan', 'Menteng Dalam'],
  'setiabudi': ['Setiabudi', 'Karet', 'Karet Semanggi', 'Karet Kuningan', 'Kuningan Timur', 'Menteng Atas', 'Pasar Manggis', 'Guntur'],
  'menteng': ['Menteng', 'Pegangsaan', 'Cikini', 'Gondangdia', 'Kebon Sirih'],
  'tanah abang': ['Bendungan Hilir', 'Karet Tengsin', 'Kebon Melati', 'Kebon Kacang', 'Kampung Bali', 'Petamburan', 'Gelora'],
  'gambir': ['Gambir', 'Kebon Kelapa', 'Petojo Selatan', 'Duri Pulo', 'Petojo Utara', 'Cideng'],
  'senen': ['Senen', 'Kenari', 'Paseban', 'Kramat', 'Kwitang', 'Bungur'],
  'kelapa gading': ['Kelapa Gading Barat', 'Kelapa Gading Timur', 'Pegangsaan Dua'],
  'tanjung priok': ['Tanjung Priok', 'Kebon Bawang', 'Sungai Bambu', 'Papanggo', 'Warakas', 'Sunter Agung', 'Sunter Jaya'],
  'penjaringan': ['Penjaringan', 'Pluit', 'Pejagalan', 'Kapuk Muara', 'Kamal Muara'],
  'cengkareng': ['Cengkareng Barat', 'Cengkareng Timur', 'Duri Kosambi', 'Kapuk', 'Kedaung Kali Angke', 'Rawa Buaya'],
  'grogol petamburan': ['Grogol', 'Jelambar', 'Jelambar Baru', 'Tanjung Duren Selatan', 'Tanjung Duren Utara', 'Tomang', 'Wijaya Kusuma'],
  'matraman': ['Pisangan Baru', 'Utan Kayu Selatan', 'Utan Kayu Utara', 'Kayu Manis', 'Pal Miam', 'Kebon Manggis'],
  'jatinegara': ['Bali Mester', 'Kampung Melayu', 'Bidaracina', 'Cipinang Cempedak', 'Rawa Bunga', 'Cipinang Besar Utara', 'Cipinang Besar Selatan', 'Cipinang Muara'],
  'duren sawit': ['Pondok Bambu', 'Duren Sawit', 'Pondok Kelapa', 'Pondok Kopi', 'Malaka Jaya', 'Malaka Sari', 'Klender'],

  // --- KOTA SURABAYA ---
  'gubeng': ['Airlangga', 'Baratajaya', 'Gubeng', 'Kertajaya', 'Mojo', 'Pucangsewu'],
  'wonokromo': ['Darmo', 'Jagir', 'Ngagel', 'Ngagelrejo', 'Sawunggaling', 'Wonokromo'],
  'tegalsari': ['Dr. Soetomo', 'Kedungdoro', 'Keputran', 'Tegalsari', 'Wonorejo'],
  'rungkut': ['Kali Rungkut', 'Kedung Baruk', 'Medokan Ayu', 'Penjaringan Sari', 'Rungkut Kidul', 'Wonorejo'],
  'genteng': ['Embong Kaliasin', 'Genteng', 'Kapasari', 'Ketabang', 'Peneleh'],
  'sukolilo': ['Gebang Putih', 'Keputih', 'Klampis Ngasem', 'Medokan Semampir', 'Menur Pumpungan', 'Nginden Jangkungan', 'Semolowaru'],
  'tandes': ['Balongsari', 'Banjar Sugihan', 'Karang Poh', 'Manukan Kulon', 'Manukan Wetan', 'Tandes'],

  // --- KOTA SEMARANG ---
  'semarang tengah': ['Bangunharjo', 'Brumbungan', 'Gabahan', 'Jagalan', 'Karangkidul', 'Kauman', 'Kembangsari', 'Kranggan', 'Miroto', 'Pandansari', 'Pekunden', 'Pendrikan Kidul', 'Pendrikan Lor', 'Purwodinatan', 'Sekayu'],
  'semarang barat': ['Bojongsalaman', 'Bongsari', 'Cabean', 'Gisikdrono', 'Kalibanteng Kidul', 'Kalibanteng Kulon', 'Karangayu', 'Krobokan', 'Manyaran', 'Ngemplak Simongan', 'Salamanmloyo', 'Tambakharjo', 'Tawangmas', 'Tawangsari'],
  'semarang selatan': ['Barusari', 'Bulustalan', 'Lamper Kidul', 'Lamper Lor', 'Lamper Tengah', 'Mugassari', 'Peterongan', 'Pleburan', 'Randusari', 'Wonodri'],
  'banyumanik': ['Banyumanik', 'Gedawang', 'Jabungan', 'Ngesrep', 'Padangsari', 'Pedalangan', 'Pudakpayung', 'Srondol Kulon', 'Srondol Wetan', 'Sumurboto', 'Tinjomoyo'],
  'pedurungan': ['Gemah', 'Kalisegoro', 'Muktiharjo Kidul', 'Palebon', 'Pedurungan Kidul', 'Pedurungan Lor', 'Pedurungan Tengah', 'Penggaron Kidul', 'Plamongan Sari', 'Tlogomulyo', 'Tlogosari Kulon', 'Tlogosari Wetan'],

  // --- KOTA MEDAN ---
  'medan kota': ['Mesjid', 'Pasar Baru', 'Pasar Merah Barat', 'Pusat Pasar', 'Sei Rengas I', 'Sitirejo I', 'Sudirejo I', 'Sudirejo II', 'Teladan Barat', 'Teladan Timur'],
  'medan barat': ['Glugur Kota', 'Karang Berombak', 'Kesawan', 'Pulo Brayan Kota', 'Sei Agul', 'Silalas'],
  'medan sunggal': ['Babura Sunggal', 'Lalang', 'Sei Sikambing B', 'Simpang Tanjung', 'Sunggal', 'Tanjung Rejo'],
  'medan baru': ['Babura', 'Darwasa', 'Merdeka', 'Padang Bulan', 'Petisah Hulu', 'Titi Rantai'],
  'medan petisah': ['Petisah Tengah', 'Sekip', 'Sei Putih Barat', 'Sei Putih Tengah', 'Sei Putih Timur I', 'Sei Putih Timur II', 'Sei Sikambing D'],

  // --- KOTA MAKASSAR ---
  'ujung pandang': ['Baru', 'Bulogading', 'Lae-Lae', 'Lajangiru', 'Losari', 'Maloku', 'Mangkura', 'Pisang Selatan', 'Pisang Utara', 'Sawerigading'],
  'panakkukang': ['Karampuang', 'Masale', 'Pampang', 'Panaikang', 'Pandang', 'Paropo', 'Sinrijawa', 'Tamamaung', 'Tellumpoccoe', 'Tello Baru'],
  'rappocini': ['Balla Parang', 'Banta-Bantaeng', 'Bonto Makkio', 'Buakana', 'Gunung Sari', 'Karunrung', 'Kassi-Kassi', 'Mapala', 'Minasa Upa', 'Rappocini', 'Tidung'],
  'tamalanrea': ['Bira', 'Kapasa', 'Kapasa Raya', 'Parang Tambung', 'Tamalanrea', 'Tamalanrea Indah', 'Tamalanrea Jaya'],
  'biringkanaya': ['Bakung', 'Berua', 'Bulurokeng', 'Daya', 'Katimbang', 'Laikang', 'Pai', 'Paccerakkang', 'Sudiang', 'Sudiang Raya', 'Untia'],

  // --- KOTA YOGYAKARTA ---
  'danurejan': ['Bausasran', 'Suryatmajan', 'Tegal Panggung'],
  'gedongtengen': ['Pringgokusuman', 'Sosromenduran'],
  'gondokusuman': ['Baciro', 'Demangan', 'Klitren', 'Kotabaru', 'Terban'],
  'kraton': ['Kadipaten', 'Panembahan', 'Patehan'],
  'umbulharjo': ['Giwangan', 'Muja Muju', 'Pandeyan', 'Semaki', 'Sorosutan', 'Tahunan', 'Warungboto'],
  'kotagede': ['Prenggan', 'Purbayan', 'Rejowinangun'],

  // --- KOTA DENPASAR ---
  'denpasar barat': ['Dauh Puri', 'Dauh Puri Kangin', 'Dauh Puri Kauh', 'Dauh Puri Klod', 'Padangsambian', 'Padangsambian Kaja', 'Padangsambian Klod', 'Pemecutan', 'Pemecutan Klod', 'Tegal Harum', 'Tegal Kerta'],
  'denpasar timur': ['Dangin Puri', 'Dangin Puri Klod', 'Kesiman', 'Kesiman Petilan', 'Kesiman Kertalangu', 'Penatih', 'Penatih Dangin Puri', 'Sumerta', 'Sumerta Kaja', 'Sumerta Kauh', 'Sumerta Kelod'],
  'denpasar selatan': ['Panjer', 'Pedungan', 'Pemogan', 'Renon', 'Sanur', 'Sanur Kaja', 'Sanur Kauh', 'Serangan', 'Sesetan', 'Sidakarya'],
  'denpasar utara': ['Dangin Puri Kaja', 'Dangin Puri Kangin', 'Dangin Puri Kauh', 'Peguyangan', 'Peguyangan Kaja', 'Peguyangan Kangin', 'Tonja', 'Ubung', 'Ubung Kaja'],
};

// Open-source static API endpoint
const API_BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

/**
 * Fetch all Indonesian provinces
 */
export async function getProvincesAsync(): Promise<string[]> {
  try {
    if (!cache.provinces) {
      const res = await fetch(`${API_BASE_URL}/provinces.json`);
      if (res.ok) {
        cache.provinces = await res.json();
      }
    }
    if (cache.provinces && cache.provinces.length > 0) {
      return cache.provinces.map(p => toTitleCase(p.name));
    }
  } catch (err) {
    console.warn('API wilayah provinces fetch fallback:', err);
  }
  return [];
}

/**
 * Find Province API Item
 */
export function findProvinceItem(provinceName: string): ApiItem | undefined {
  if (!cache.provinces) return undefined;
  const clean = provinceName.toLowerCase().replace(/^(provinsi)\s+/i, '').trim();
  return cache.provinces.find(p => {
    const pName = p.name.toLowerCase();
    return pName === clean || pName.includes(clean) || clean.includes(pName);
  });
}

/**
 * Fetch regencies (Kota / Kabupaten) for a province
 */
export async function getRegenciesAsync(provinceName: string): Promise<string[]> {
  try {
    if (!cache.provinces) {
      await getProvincesAsync();
    }
    const provItem = findProvinceItem(provinceName);
    if (provItem) {
      if (!cache.regencies.has(provItem.id)) {
        const res = await fetch(`${API_BASE_URL}/regencies/${provItem.id}.json`);
        if (res.ok) {
          const list: ApiItem[] = await res.json();
          cache.regencies.set(provItem.id, list);
        }
      }
      const regList = cache.regencies.get(provItem.id);
      if (regList && regList.length > 0) {
        return regList.map(r => toTitleCase(r.name));
      }
    }
  } catch (err) {
    console.warn('API wilayah regencies fetch fallback:', err);
  }
  return [];
}

/**
 * Find Regency API Item
 */
export async function findRegencyItem(provinceName: string, cityName: string): Promise<ApiItem | undefined> {
  if (!cache.provinces) await getProvincesAsync();
  const provItem = findProvinceItem(provinceName);
  if (!provItem) return undefined;

  let regList = cache.regencies.get(provItem.id);
  if (!regList) {
    await getRegenciesAsync(provinceName);
    regList = cache.regencies.get(provItem.id);
  }
  if (!regList) return undefined;

  const cleanCity = cityName.toLowerCase().replace(/^(kota|kabupaten|kab\.)\s+/i, '').trim();
  return regList.find(r => {
    const rName = r.name.toLowerCase().replace(/^(kota|kabupaten|kab\.)\s+/i, '').trim();
    return rName === cleanCity || rName.includes(cleanCity) || cleanCity.includes(rName);
  });
}

/**
 * Fetch districts (Kecamatan) for a city/regency
 */
export async function getDistrictsAsync(provinceName: string, cityName: string): Promise<string[]> {
  try {
    const regItem = await findRegencyItem(provinceName, cityName);
    if (regItem) {
      if (!cache.districts.has(regItem.id)) {
        const res = await fetch(`${API_BASE_URL}/districts/${regItem.id}.json`);
        if (res.ok) {
          const list: ApiItem[] = await res.json();
          cache.districts.set(regItem.id, list);
        }
      }
      const distList = cache.districts.get(regItem.id);
      if (distList && distList.length > 0) {
        return distList.map(d => toTitleCase(d.name));
      }
    }
  } catch (err) {
    console.warn('API wilayah districts fetch fallback:', err);
  }
  return [];
}

/**
 * Find District API Item
 */
export async function findDistrictItem(provinceName: string, cityName: string, districtName: string): Promise<ApiItem | undefined> {
  const regItem = await findRegencyItem(provinceName, cityName);
  if (!regItem) return undefined;

  let distList = cache.districts.get(regItem.id);
  if (!distList) {
    await getDistrictsAsync(provinceName, cityName);
    distList = cache.districts.get(regItem.id);
  }
  if (!distList) return undefined;

  const cleanDist = districtName.toLowerCase().replace(/^(kecamatan|kec\.)\s+/i, '').trim();
  return distList.find(d => {
    const dName = d.name.toLowerCase().replace(/^(kecamatan|kec\.)\s+/i, '').trim();
    return dName === cleanDist || dName.includes(cleanDist) || cleanDist.includes(dName);
  });
}

/**
 * Fetch villages (Desa / Kelurahan) for a district
 */
export async function getVillagesAsync(provinceName: string, cityName: string, districtName: string): Promise<string[]> {
  try {
    const distItem = await findDistrictItem(provinceName, cityName, districtName);
    if (distItem) {
      if (!cache.villages.has(distItem.id)) {
        const res = await fetch(`${API_BASE_URL}/villages/${distItem.id}.json`);
        if (res.ok) {
          const list: ApiItem[] = await res.json();
          cache.villages.set(distItem.id, list);
        }
      }
      const vList = cache.villages.get(distItem.id);
      if (vList && vList.length > 0) {
        return vList.map(v => toTitleCase(v.name));
      }
    }
  } catch (err) {
    console.warn('API wilayah villages fetch fallback:', err);
  }

  // Offline dictionary check
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
}
