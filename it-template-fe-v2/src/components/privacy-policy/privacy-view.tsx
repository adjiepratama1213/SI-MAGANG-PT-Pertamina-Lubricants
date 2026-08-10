// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { alpha, useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';
import Iconify from 'src/components/iconify';
import PrivacyHero from './privacy-hero';

// ----------------------------------------------------------------------

type SectionCardProps = {
  section: {
    id: number;
    title: string;
    icon: string;
    color: string;
  };
  index: number;
  content: React.ReactNode;
};

function SectionCard({ section, index, content }: SectionCardProps) {
  const theme = useTheme();

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.06)}`,
        willChange: 'transform, opacity',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction="row" spacing={2.5} alignItems="flex-start" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2.5,
              bgcolor: alpha(section.color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `2px solid ${alpha(section.color, 0.2)}`,
            }}
          >
            <Iconify icon={section.icon} width={32} sx={{ color: section.color }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Chip
              label={`Bagian ${section.id}`}
              size="small"
              sx={{
                bgcolor: alpha(section.color, 0.1),
                color: section.color,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                mb: 1.5,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.125rem', md: '1.375rem' },
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.3,
              }}
            >
              {section.title}
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ mb: 3, borderColor: alpha(theme.palette.grey[500], 0.12) }} />
        {content}
      </CardContent>
    </Card>
  );
}

export default function TermsAndConditionsView() {
  const theme = useTheme();

  return (
    <>
      <PrivacyHero />

      <Box
        sx={{
          bgcolor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: `linear-gradient(to bottom, ${alpha((theme.palette as any).pertamina.main, 0.06)}, transparent)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Container sx={{ position: 'relative', py: { xs: 5, md: 10 } }}>
          {/* Introduction Section */}
          <Box
            sx={{
              mb: { xs: 5, md: 8 },
              textAlign: 'center',
            }}
          >
            <Chip
              icon={<Iconify icon="eva:shield-fill" width={18} />}
              label="KOMITMEN KAMI"
              sx={{
                bgcolor: alpha((theme.palette as any).pertamina.main, 0.1),
                color: (theme.palette as any).pertamina.main,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 32,
                mb: 3,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.75rem' },
                fontWeight: 800,
                mb: 3,
                background: `linear-gradient(135deg, ${(theme.palette as any).pertamina.main} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Kebijakan Privasi
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', md: '1.0625rem' },
                color: 'text.secondary',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.9,
              }}
            >
              Selamat datang di Website Program PT Pertamina Lubricants. Silakan baca
              &quot;Kebijakan Privasi&quot; berikut dengan cermat sebelum mengakses dan menggunakan
              layanan yang tersedia.
            </Typography>
          </Box>

          {/* Main Content Card */}
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.08)}`,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              bgcolor: 'background.paper',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 6 } }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha((theme.palette as any).pertamina.main, 0.04),
                  border: `1px solid ${alpha((theme.palette as any).pertamina.main, 0.1)}`,
                  mb: 5,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    textAlign: 'justify',
                    lineHeight: 1.9,
                    color: 'text.primary',
                  }}
                >
                  Kebijakan Privasi ini merupakan komitmen dari PT Pertamina Lubricants (selanjutnya
                  disebut &quot;Pertamina&quot;) untuk menghargai dan melindungi setiap data atau
                  informasi pribadi pengguna (selanjutnya disebut &quot;Pengguna&quot;) yang
                  diberikan kepada Pertamina atau yang dikumpulkan melalui layanan yang tersedia.
                </Typography>
              </Box>

              <Divider sx={{ my: 5, borderColor: alpha(theme.palette.grey[500], 0.12) }} />

              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2.125rem' },
                  fontWeight: 700,
                  mb: 5,
                  color: 'text.primary',
                  textAlign: 'center',
                }}
              >
                Kebijakan Privasi ini mencakup:
              </Typography>

              <Stack spacing={3}>
                {/* Section 1 */}
                <SectionCard
                  section={{
                    id: 1,
                    title: 'Perolehan dan Pengumpulan Data Pribadi Pengguna',
                    icon: 'eva:file-text-fill',
                    color: '#00A76F',
                  }}
                  index={0}
                  content={
                    <>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          textAlign: 'justify',
                          lineHeight: 1.9,
                          color: 'text.secondary',
                          mb: 3,
                        }}
                      >
                        Pertamina mengumpulkan Data Pribadi Pengguna dengan tujuan untuk
                        meningkatkan layanan, mengelola transaksi, serta tujuan lain yang diizinkan
                        oleh peraturan perundang-undangan yang berlaku. Data Pribadi yang
                        dikumpulkan dapat mencakup:
                      </Typography>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: alpha('#00A76F', 0.04),
                          border: `1px solid ${alpha('#00A76F', 0.1)}`,
                          mb: 3,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}
                        >
                          Data yang diberikan secara langsung oleh Pengguna:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                          {[
                            'Nama, nomor telepon, alamat email, dan informasi lain yang dapat mengidentifikasi Pengguna',
                            'Data transaksi, seperti jenis, jumlah, metode pembayaran, tanggal, dan detail transaksi lainnya',
                            'Data yang diperoleh dari survei, formulir pendaftaran, atau komunikasi langsung dengan layanan pelanggan',
                            'Data yang diperoleh melalui fitur interaktif yang terdapat pada platform Pertamina',
                          ].map((item, idx) => (
                            <Typography
                              key={idx}
                              component="li"
                              variant="body2"
                              sx={{ mb: 1.5, lineHeight: 1.8, color: 'text.secondary' }}
                            >
                              {item}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: alpha('#2065D1', 0.04),
                          border: `1px solid ${alpha('#2065D1', 0.1)}`,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}
                        >
                          Data yang dikumpulkan secara otomatis:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                          {[
                            'Informasi perangkat, seperti jenis perangkat, sistem operasi, dan pengaturan perangkat',
                            'Data lokasi, alamat IP, dan informasi jaringan',
                            'Data perilaku penggunaan, termasuk interaksi dengan layanan dan preferensi Pengguna',
                          ].map((item, idx) => (
                            <Typography
                              key={idx}
                              component="li"
                              variant="body2"
                              sx={{ mb: 1.5, lineHeight: 1.8, color: 'text.secondary' }}
                            >
                              {item}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: 'justify',
                          lineHeight: 1.9,
                          color: 'text.secondary',
                          mt: 3,
                        }}
                      >
                        Pertamina dapat menggabungkan data yang diperoleh dari sumber tersebut
                        dengan data lain yang dimilikinya.
                      </Typography>
                    </>
                  }
                />

                {/* Section 2 */}
                <SectionCard
                  section={{
                    id: 2,
                    title: 'Pengumpulan Data Pribadi',
                    icon: 'eva:cloud-upload-fill',
                    color: '#2065D1',
                  }}
                  index={1}
                  content={
                    <>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          textAlign: 'justify',
                          lineHeight: 1.9,
                          color: 'text.secondary',
                          mb: 3,
                        }}
                      >
                        Penyediaan Data Pribadi bersifat sukarela. Pertamina akan mengumpulkan Data
                        Pribadi setiap kali pengguna mengakses layanan atau melakukan transaksi
                        menggunakan platform yang tersedia.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          textAlign: 'justify',
                          lineHeight: 1.9,
                          color: 'text.secondary',
                          mb: 2,
                        }}
                      >
                        Pertamina akan melakukan Pemrosesan Data Pribadi untuk tujuan sebagai
                        berikut maupun tujuan lain yang diizinkan oleh peraturan perundang-undangan
                        yang berlaku:
                      </Typography>
                      <Box
                        component="ul"
                        sx={{
                          pl: 2.5,
                          m: 0,
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                          gap: 1.5,
                        }}
                      >
                        {[
                          'Identifikasi dan registrasi akun pengguna',
                          'Melakukan verifikasi, menonaktifkan atau mengelola data pengguna',
                          'Mencegah, mendeteksi, menyelidiki, dan mengatasi tindakan yang dilarang atau ilegal, termasuk penipuan (fraud)',
                          'Pengumpulan data demografis pengguna',
                          'Pengiriman atau pembagian Data Pribadi berdasarkan permintaan dari aparat penegak hukum atau instansi berwenang',
                          'Pengiriman informasi yang dianggap berguna termasuk layanan dari Pertamina',
                          'Berkomunikasi dengan pengguna sehubungan dengan layanan yang tersedia',
                          'Penggunaan data untuk kegiatan promosi dan pemasaran layanan',
                        ].map((item, idx) => (
                          <Typography
                            key={idx}
                            component="li"
                            variant="body2"
                            sx={{ lineHeight: 1.8, color: 'text.secondary' }}
                          >
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    </>
                  }
                />

                {/* Section 3 */}
                <SectionCard
                  section={{
                    id: 3,
                    title: 'Pengungkapan Data Pribadi',
                    icon: 'eva:share-fill',
                    color: '#7635dc',
                  }}
                  index={2}
                  content={
                    <>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          textAlign: 'justify',
                          lineHeight: 1.9,
                          color: 'text.secondary',
                          mb: 3,
                        }}
                      >
                        Pertamina berkomitmen untuk menjaga kerahasiaan Data Pribadi pengguna dan
                        menjamin tidak ada pengungkapan, penjualan, pengalihan, distribusi, dan/atau
                        peminjaman Data Pribadi kepada pihak lain, tanpa persetujuan pengguna,
                        kecuali dalam hal-hal yang diizinkan oleh peraturan perundang-undangan
                        sebagai berikut:
                      </Typography>
                      <Stack spacing={2}>
                        {[
                          {
                            label: 'a)',
                            text: 'Dibutuhkan adanya pengungkapan Data Pribadi kepada mitra usaha Pertamina atau pihak lain yang membantu dalam menyajikan layanan dan memproses segala bentuk aktivitas pengguna.',
                          },
                          {
                            label: 'b)',
                            text: 'Penyediaan dan pengungkapan Data Pribadi kepada mitra usaha Pertamina sesuai dengan persetujuan pengguna, termasuk integrasi dengan aplikasi atau situs lain, atau penyelenggaraan promosi dan layanan khusus.',
                          },
                          {
                            label: 'c)',
                            text: 'Penyediaan dan pengungkapan Data Pribadi kepada pihak ketiga yang menggunakan dan mengintegrasikan API publik yang tersedia dalam platform Pertamina.',
                          },
                          {
                            label: 'd)',
                            text: 'Dibutuhkan adanya komunikasi antara mitra usaha Pertamina (seperti SPBU, penyedia pembayaran, dan penyedia layanan lainnya) dengan pengguna untuk penyelesaian kendala atau keperluan lainnya.',
                          },
                        ].map((item, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              p: 2,
                              borderRadius: 1.5,
                              bgcolor: alpha('#7635dc', 0.04),
                              border: `1px solid ${alpha('#7635dc', 0.1)}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                textAlign: 'justify',
                                lineHeight: 1.9,
                                color: 'text.secondary',
                              }}
                            >
                              <strong>{item.label}</strong> {item.text}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  }
                />

                {/* Section 4 */}
                <SectionCard
                  section={{
                    id: 4,
                    title: 'Cookies',
                    icon: 'eva:settings-fill',
                    color: '#fda92d',
                  }}
                  index={3}
                  content={
                    <>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Cookies adalah file kecil yang secara otomatis akan tersimpan di perangkat
                        pengguna untuk menyimpan preferensi maupun konfigurasi selama mengakses
                        platform.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Cookies tidak digunakan untuk mengakses data lain di perangkat pengguna
                        selain dari yang telah disetujui oleh pengguna.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Pengguna dapat memilih untuk menolak cookies melalui pengaturan browser
                        mereka. Namun, hal ini dapat mempengaruhi pengalaman penggunaan layanan pada
                        platform.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Platform ini menggunakan fitur analitik pihak ketiga, seperti Google
                        Analytics, untuk memahami perilaku pengguna dan mengembangkan fitur serta
                        layanan. Jika pengguna tidak ingin data mereka terlacak, mereka dapat
                        menggunakan Add-On Google Analytics Opt-Out Browser.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Pertamina dapat menggunakan fitur-fitur pihak ketiga untuk meningkatkan
                        layanan, termasuk analisis dan penyajian promo berdasarkan riwayat
                        penggunaan.
                      </Typography>
                    </>
                  }
                />

                {/* Section 5 */}
                <SectionCard
                  section={{
                    id: 5,
                    title: 'Pilihan Pengguna dan Transparansi',
                    icon: 'eva:options-2-fill',
                    color: '#00B8D9',
                  }}
                  index={4}
                  content={
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Perangkat seluler (iOS dan Android) memiliki pengaturan sehingga platform
                        tidak dapat mengakses data tertentu tanpa persetujuan pengguna. Pemberian
                        akses ini dianggap sebagai persetujuan pengguna terhadap pengumpulan dan
                        penggunaan Data Pribadi.
                      </Typography>
                  }
                />

                {/* Section 6 */}
                <SectionCard
                  section={{
                    id: 6,
                    title: 'Keamanan, Penyimpanan, dan Penghapusan Data Pribadi',
                    icon: 'eva:shield-fill',
                    color: '#FF5630',
                  }}
                  index={5}
                  content={
                    <>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Pertamina melindungi Data Pribadi pengguna dengan langkah-langkah keamanan
                        termasuk kata sandi dan kode OTP.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Data dapat disimpan di luar negeri oleh mitra Pertamina sesuai dengan
                        kebijakan perlindungan data yang berlaku.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Meskipun upaya terbaik telah dilakukan untuk mengamankan data, transmisi
                        melalui internet tidak sepenuhnya aman. Oleh karena itu, pengguna
                        bertanggung jawab atas informasi yang diberikan.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Pertamina akan menghapus atau menganonimkan Data Pribadi yang tidak lagi
                        diperlukan sesuai dengan peraturan yang berlaku.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Beberapa data mungkin tetap disimpan oleh instansi lain sesuai kebijakan
                        mereka.
                      </Typography>
                    </>
                  }
                />

                {/* Section 7 */}
                <SectionCard
                  section={{
                    id: 7,
                    title:
                      'Akses dan Perbaikan Data Pribadi Peserta Program atau Penarikan Kembali Persetujuan Peserta Program',
                    icon: 'eva:edit-fill',
                    color: '#22C55E',
                  }}
                  index={6}
                  content={
                    <>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Pertamina mengambil langkah-langkah yang wajar untuk memastikan bahwa Data
                        Pribadi Peserta Program diproses secara akurat dan lengkap. Namun demikian,
                        penting bagi Peserta Program untuk memberi tahu Pertamina secara tepat waktu
                        tentang segala perubahan pada Data Pribadi Peserta Program atau jika ada
                        kesalahan dalam Data Pribadi Peserta Program yang berada di bawah kendali
                        Pertamina melalui Website Program.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Peserta Program berhak untuk mengakses atau mengoreksi Data Pribadi Peserta
                        Program yang berada di bawah kendali Pertamina melalui layanan 135 atau
                        Website Program yang tersedia dalam Kebijakan Privasi ini. Namun demikian,
                        permohonan tersebut hanya akan diproses oleh Pertamina apabila Peserta
                        Program telah menyerahkan bukti identitas yang memadai untuk melakukan akses
                        atau koreksi terhadap data tersebut. Pertamina berhak menolak permohonan
                        untuk mengakses, atau untuk memperbaiki, sebagian atau semua Data Pribadi
                        Peserta Program yang dimiliki atau dikuasai Pertamina sepanjang tidak
                        bertentangan dengan peraturan perundang-undangan yang berlaku.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Pertamina dapat membebankan biaya administrasi kepada Peserta Program untuk
                        menangani permintaan Peserta Program untuk mengakses atau mengoreksi Data
                        Pribadi Peserta Program.
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Peserta Program dapat menarik persetujuan yang telah diberikan terkait
                        dengan pemrosesan Data Pribadi Peserta Program yang ada di bawah kendali
                        Pertamina dengan mengirimkan permintaan tersebut melalui layanan 135 atau
                        Website Program yang tercantum dalam Kebijakan Privasi ini. Pertamina akan
                        memproses permintaan Peserta Program dalam kurun waktu yang wajar sejak
                        permintaan penarikan persetujuan tersebut disampaikan, dan selanjutnya
                        Pertamina tidak melakukan Pemrosesan Data Pribadi Peserta Program sesuai
                        dengan permintaan Peserta Program, kecuali diwajibkan oleh peraturan
                        perundang-undangan yang berlaku. Dalam hal terdapat penarikan persetujuan,
                        Pertamina mungkin tidak dapat melaksanakan kewajiban-kewajibannya
                        berdasarkan setiap perjanjian antara Peserta Program dengan Pertamina.
                        Sehubungan dengan hal tersebut, terdapat juga kemungkinan bahwa dikarenakan
                        Pertamina tidak dapat melaksanakan kewajibannya oleh karena Peserta Program
                        menarik persetujuannya, setiap hubungan hukum antara Peserta Program dengan
                        Pertamina menjadi berakhir dan tidak dapat dilanjutkan.
                      </Typography>
                    </>
                  }
                />

                {/* Section 8 */}
                <SectionCard
                  section={{
                    id: 8,
                    title: 'Pengaduan terkait Perlindungan Data',
                    icon: 'eva:message-circle-fill',
                    color: '#FFAB00',
                  }}
                  index={7}
                  content={
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Jika Pengguna memiliki kekhawatiran tentang penanganan atau perlakuan
                        Pertamina terhadap Data Pribadi atau jika Pengguna yakin bahwa privasinya
                        telah dilanggar, Pengguna dapat menghubungi Pertamina melalui layanan
                        pelanggan di <strong>135</strong>.
                      </Typography>
                  }
                />

                {/* Section 9 */}
                <SectionCard
                  section={{
                    id: 9,
                    title: 'Hubungi Kami',
                    icon: 'eva:phone-fill',
                    color: '#8E33FF',
                  }}
                  index={8}
                  content={
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Dalam hal Pengguna memiliki pertanyaan, komentar, keluhan, atau klaim
                        mengenai Kebijakan Privasi ini, Pengguna dapat menghubungi layanan pelanggan
                        di <strong>135</strong>.
                      </Typography>
                  }
                />

                {/* Section 10 */}
                <SectionCard
                  section={{
                    id: 10,
                    title: 'Penyimpanan dan Penghapusan Informasi',
                    icon: 'eva:trash-2-fill',
                    color: '#B71D18',
                  }}
                  index={9}
                  content={
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Pertamina akan menyimpan informasi selama diperlukan untuk tujuan yang
                        disebutkan dalam kebijakan ini dan sesuai dengan peraturan hukum yang
                        berlaku.
                      </Typography>
                  }
                />

                {/* Section 11 */}
                <SectionCard
                  section={{
                    id: 11,
                    title: 'Pembaruan Kebijakan Privasi',
                    icon: 'eva:refresh-fill',
                    color: '#006C9C',
                  }}
                  index={10}
                  content={
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ textAlign: 'justify', lineHeight: 1.9, color: 'text.secondary' }}
                      >
                        Kami dapat sewaktu-waktu melakukan perubahan atau pembaharuan terhadap
                        Kebijakan Privasi untuk memastikan kepatuhan terhadap peraturan yang
                        berlaku.
                      </Typography>
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}
