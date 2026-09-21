import { useState, useMemo, useEffect, Component } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider,
  Tabs, Tab, alpha, Collapse, Menu, Autocomplete,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useSearchUsers } from 'src/pages/user-mgmt/query';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { UploadAvatar, Upload } from 'src/components/upload';
import { fData } from 'src/utils/format-number';
import { toast } from 'react-toastify';

const DUMMY_DATA = [
  { id: 1, name: 'Alyssa Afadila R', nim: '433221088', kampus: 'Universitas Airlangga', jurusan: 'Manajemen Perkantoran Digital', program: 'PKL', status_aktif: 'Aktif', direktorat: 'Direktorat Finance & Business Support', fungsi: 'Sumber Daya Manusia', subFungsi: 'Pengembangan SDM', mentor: 'Gaston Alfonsa', periode: '1 Jul 2025 - 1 Desember 2025', kelamin: 'Perempuan', kontak: '081517981009', tglLahir: '15 Oct 2004', thnLulus: '-', statusMagang: 'PKL', bank: '-', noRek: '-', dokumen: ['Proposal Magang.pdf', 'Surat Pengantar Kampus.pdf', 'MOU Magang.pdf'] },
  { id: 2, name: 'Gaston Alfonsa', nim: '123456789', kampus: '-', jurusan: '-', program: 'Internship PTPL', status_aktif: 'Tidak Aktif', direktorat: 'Direktorat Operasi', fungsi: 'Unit Produksi', subFungsi: 'Produksi I', mentor: '-', periode: '-', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'Internship PTPL', bank: '-', noRek: '-', dokumen: [] },
  { id: 3, name: 'Harding Long', nim: '987654321', kampus: '-', jurusan: '-', program: 'Internship Kemnaker', status_aktif: 'Aktif', direktorat: 'Direktorat Sales & Marketing', fungsi: 'VP Sales & Marketing', subFungsi: 'Sales', mentor: '-', periode: '-', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'Internship Kemnaker', bank: '-', noRek: '-', dokumen: [] },
  { id: 4, name: 'Jovanz Mikail Baihaqi', nim: '187221077', kampus: 'Universitas Airlangga', jurusan: 'Sistem Informasi', program: 'PKL', status_aktif: 'Aktif', direktorat: 'Direktorat Utama & Pengawasan', fungsi: 'Internal Audit', subFungsi: 'Audit TI', mentor: '-', periode: '2025 - Feb 2026', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'PKL', bank: '-', noRek: '-', dokumen: [] },
];

const DUMMY_PERPANJANGAN = [
  { id: 1, name: 'Alyssa Afadila R', nim: '433221088', program: 'PKL', mentor: 'Gaston Alfonsa', periodeLama: '1 Jul 2025 - 1 Des 2025', periodeBaru: '1 Des 2025 - 1 Feb 2026', alasan: 'Penyelesaian Proyek Akhir', status: 'Menunggu', dokumen: 'Surat_Perpanjangan.pdf' },
  { id: 2, name: 'Harding Long', nim: '987654321', program: 'Internship Kemnaker', mentor: '-', periodeLama: '1 Jan 2025 - 1 Jun 2025', periodeBaru: '1 Jun 2025 - 1 Sep 2025', alasan: 'Rekomendasi Mentor', status: 'Disetujui', dokumen: 'Rekomendasi_Mentor.pdf' },
];

const DUMMY_KUOTA = [
  {
    id: 'd1',
    name: 'Direktorat Finance & Business Support',
    totalKuota: 10,
    terisi: 1,
    fungsi: [
      {
        id: 'f1',
        name: 'Sumber Daya Manusia',
        totalKuota: 5,
        terisi: 1,
        subFungsi: [
          { id: 'sf1', name: 'Pengembangan SDM', kuota: 3, terisi: 1 },
          { id: 'sf2', name: 'Rekrutmen', kuota: 2, terisi: 0 },
        ]
      },
      {
        id: 'f2',
        name: 'Keuangan',
        totalKuota: 5,
        terisi: 0,
        subFungsi: [
          { id: 'sf3', name: 'Akuntansi', kuota: 5, terisi: 0 },
        ]
      }
    ]
  },
  {
    id: 'd2',
    name: 'Direktorat Operasi',
    totalKuota: 46,
    terisi: 20,
    fungsi: [
      {
        id: 'f3',
        name: 'Unit Produksi',
        totalKuota: 46,
        terisi: 20,
        subFungsi: [
          { id: 'sf4', name: 'Produksi I', kuota: 20, terisi: 10 },
          { id: 'sf5', name: 'Produksi II', kuota: 26, terisi: 10 },
        ]
      }
    ]
  },
  {
    id: 'd3',
    name: 'Direktorat Utama & Pengawasan',
    totalKuota: 15,
    terisi: 1,
    fungsi: [
      {
        id: 'f4',
        name: 'Internal Audit',
        totalKuota: 15,
        terisi: 1,
        subFungsi: [
          { id: 'sf6', name: 'Audit TI', kuota: 15, terisi: 1 },
        ]
      }
    ]
  },
  {
    id: 'd4',
    name: 'Direktorat Sales & Marketing',
    totalKuota: 28,
    terisi: 0,
    fungsi: [
      {
        id: 'f5',
        name: 'VP Sales & Marketing',
        totalKuota: 28,
        terisi: 0,
        subFungsi: [
          { id: 'sf7', name: 'Sales', kuota: 28, terisi: 0 },
        ]
      }
    ]
  }
];

function DirektoratRow({ row, onEdit }: { row: any, onEdit: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: open ? '#f8fafc' : 'transparent' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            <Iconify icon={open ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"} />
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
          {row.name}
        </TableCell>
        <TableCell align="center">{row.totalKuota}</TableCell>
        <TableCell align="center">{row.terisi}</TableCell>
        <TableCell align="center">{row.totalKuota - row.terisi}</TableCell>
        <TableCell align="center">
          <Button size="small" onClick={onEdit} sx={{ minWidth: 'auto', px: 1 }}>Edit</Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, ml: 4 }}>
              <Table size="small" aria-label="fungsi">
                <TableBody>
                  {(row.fungsi || []).map((f: any) => (
                    <FungsiRow key={f.id} row={f} onEditFungsi={onEdit} onEditSubFungsi={onEdit} />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function FungsiRow({ row, onEditFungsi, onEditSubFungsi, onDeleteOrg }: { row: any, onEditFungsi: (f: any) => void, onEditSubFungsi: (f: any, sf: any) => void, onDeleteOrg: (id: string, name: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell width={50} align="center">
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            <Iconify icon={open ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"} />
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 'medium' }}>{row.name}</TableCell>
        <TableCell align="center" width={120}>{row.totalKuota}</TableCell>
        <TableCell align="center" width={100}>{row.terisi}</TableCell>
        <TableCell align="center" width={100}>{row.totalKuota - row.terisi}</TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          <IconButton size="small" color="primary" onClick={() => onEditFungsi(row)} sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} title="Detail / Edit">
            <Iconify icon="solar:eye-bold-duotone" width={20} />
          </IconButton>
          <IconButton size="small" color="error" title="Hapus" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} onClick={() => onDeleteOrg(row.dbId, row.name)}>
            <Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0, border: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small" sx={{ tableLayout: 'fixed', mb: 2 }}>
              <TableBody>
                {(row.subFungsi || []).map((sf: any) => (
                  <TableRow key={sf.id} sx={{ bgcolor: '#fdfdfd' }}>
                    <TableCell width={50} sx={{ borderBottom: '1px dashed #e2e8f0' }} />
                    <TableCell sx={{ borderBottom: '1px dashed #e2e8f0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <Iconify icon="eva:corner-down-right-outline" sx={{ mr: 1, width: 16, color: 'text.disabled' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{sf.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" width={120} sx={{ borderBottom: '1px dashed #e2e8f0' }}><Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{sf.kuota}</Typography></TableCell>
                    <TableCell align="center" width={100} sx={{ borderBottom: '1px dashed #e2e8f0' }}><Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{sf.terisi}</Typography></TableCell>
                    <TableCell align="center" width={100} sx={{ borderBottom: '1px dashed #e2e8f0' }}><Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{sf.kuota - sf.terisi}</Typography></TableCell>
                    <TableCell align="center" width={120} sx={{ whiteSpace: 'nowrap', borderBottom: '1px dashed #e2e8f0' }}>
                      <IconButton size="small" color="primary" onClick={() => onEditSubFungsi(row, sf)} sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} title="Detail / Edit">
                        <Iconify icon="solar:eye-bold-duotone" width={20} />
                      </IconButton>
                      <IconButton size="small" color="error" title="Hapus" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} onClick={() => onDeleteOrg(sf.dbId, sf.name)}>
                        <Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

class ErrorBoundary extends Component<{children: any}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }

  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }

  render() { 
    if (this.state.hasError) { 
       return <div style={{padding: 20}}><h2>DEBUG ERROR:</h2><pre>{this.state.error?.stack || this.state.error?.toString()}</pre></div>; 
    }
    return this.props.children; 
  }
}

export default function Page() {
  const [activeTab, setActiveTab] = useState('data_peserta'); // 'data_peserta' | 'perpanjangan'
  const [dialogMode, setDialogMode] = useState<'fungsi' | 'subfungsi' | 'edit_fungsi' | 'edit_subfungsi' | 'edit_dir'>('fungsi');
  const [selectedDir, setSelectedDir] = useState<any>(null);
  const [selectedFungsi, setSelectedFungsi] = useState<any>(null);
  const [selectedSubFungsi, setSelectedSubFungsi] = useState<any>(null);
  const [kuotaCount, setKuotaCount] = useState<number>(0);
  const [newFungsiName, setNewFungsiName] = useState('');
  const [newSubFungsiName, setNewSubFungsiName] = useState('');
  const [selectedFungsiId, setSelectedFungsiId] = useState('');
  const [selectedSubFungsiId, setSelectedSubFungsiId] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [openQuotaDialog, setOpenQuotaDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{id: string, name: string} | null>(null);

  const [openDeletePesertaConfirm, setOpenDeletePesertaConfirm] = useState(false);
  const [pesertaToDelete, setPesertaToDelete] = useState<any>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Edit Profile States
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [selectedMentorToAssign, setSelectedMentorToAssign] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { userSearchData, searchLoading, refetchSearch } = useSearchUsers('');

  const pesertaList = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData)) return [];
    const vps = userSearchData.filter((u: any) => u?.role === 'EMPLOYEE');

    return userSearchData
      .filter((u: any) => u?.role === 'PESERTA' && u?.status !== 'pending')
      .map((u: any) => {
         const intern = u.internProfile || {};
         const mentor = intern.mentor?.user?.name || '-';
         const dir = intern.mentor?.direktorat || '-';
         const fungsi = intern.mentor?.fungsi || '-';
         const subFungsi = intern.mentor?.subFungsi || '-';

         const vp = vps.find((v: any) => v.employeeProfile?.fungsi === fungsi);
         const vpName = vp ? vp.name : '-';

         const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
         const periode = intern.startDate || intern.endDate ? `${formatDate(intern.startDate)} - ${formatDate(intern.endDate)}` : '-';
         
         let status_aktif = intern.mentorProfileId ? 'Aktif' : 'Tidak Aktif';
         if (u.status === 'banned' || u.status === 'rejected') status_aktif = 'Tidak Aktif';
         
         return {
           id: u.id,
           name: u.name || 'Unknown',
           nim: intern.internId || '-',
           kampus: intern.university || '-',
           jurusan: intern.major || '-',
           program: intern.program || '-',
           status_aktif,
           direktorat: dir,
           fungsi,
           subFungsi,
           mentor,
           vpName,
           periode,
           kelamin: intern.gender === 'PRIA' ? 'Laki-laki' : intern.gender === 'WANITA' ? 'Perempuan' : '-',
           kontak: u.phone || '-',
           tglLahir: formatDate(intern.dateOfBirth),
           thnLulus: '-', 
           statusMagang: intern.program || '-',
           bank: intern.bankName || '-',
           noRek: intern.bankAccount || '-',
           dokumen: intern.documentUrls || [],
           raw: u
         };
      });
  }, [userSearchData]);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const fetchOrgs = async () => {
    try {
      const res = await axiosInstance.get(endpoints.employeeProfile.organizationsHierarchy);
      const data = Array.isArray(res.data) ? res.data : [];
      
      // Swap positions so Leher Dirut is first, followed by Finance & Business Support
      data.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        
        if (nameA.includes('leher dirut') && !nameB.includes('leher dirut')) return -1;
        if (nameB.includes('leher dirut') && !nameA.includes('leher dirut')) return 1;
        
        if (nameA.includes('finance & business support') && !nameB.includes('finance & business support')) return -1;
        if (nameB.includes('finance & business support') && !nameA.includes('finance & business support')) return 1;
        
        return 0;
      });
      
      setOrganizations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDir, setFilterDir] = useState('all');
  const [filterFungsi, setFilterFungsi] = useState('all');
  const [filterSubFungsi, setFilterSubFungsi] = useState('all');
  const [filterMentor, setFilterMentor] = useState('all');
  const [searchQueryPeserta, setSearchQueryPeserta] = useState('');

  const filteredPesertaList = useMemo(() => pesertaList.filter(p => {
      const matchProgram = filterProgram === 'all' || p.program === filterProgram;
      const matchStatus = filterStatus === 'all' || p.status_aktif.toLowerCase().replace(' ', '_') === filterStatus;
      const matchDir = filterDir === 'all' || p.direktorat === filterDir;
      const matchFungsi = filterFungsi === 'all' || p.fungsi === filterFungsi;
      const matchSubFungsi = filterSubFungsi === 'all' || p.subFungsi === filterSubFungsi;
      const matchMentor = filterMentor === 'all' || p.mentor === filterMentor;
      const matchSearch = p.name.toLowerCase().includes(searchQueryPeserta.toLowerCase()) || p.nim.toLowerCase().includes(searchQueryPeserta.toLowerCase());
      return matchProgram && matchStatus && matchDir && matchFungsi && matchSubFungsi && matchMentor && matchSearch;
    }), [pesertaList, filterProgram, filterStatus, filterDir, filterFungsi, filterSubFungsi, filterMentor, searchQueryPeserta]);

  const uniqueDirs = Array.from(new Set((organizations || []).map(o => o.name)));
  const uniqueFungsi = Array.from(new Set((organizations || []).flatMap(o => (o.fungsi || []).map((f: any) => f.name))));
  const uniqueSubFungsi = Array.from(new Set((organizations || []).flatMap(o => (o.fungsi || []).flatMap((f: any) => (f.subFungsi || []).map((sf: any) => sf.name)))));
  const uniqueMentors = Array.from(new Set(pesertaList.filter(p => filterSubFungsi === 'all' || p.subFungsi === filterSubFungsi).map(p => p.mentor).filter(m => m !== '-')));
  const uniquePrograms = Array.from(new Set(pesertaList.map(p => p.program).filter(p => p !== '-')));

  const kuotaData = useMemo(() => {
    if (!organizations || organizations.length === 0) return [];
    
    const mapped = JSON.parse(JSON.stringify(organizations));
    const interns = Array.isArray(userSearchData) ? userSearchData.filter((u: any) => u.role === 'PESERTA') : [];
    
    mapped.forEach((dir: any, dIndex: number) => {
       let dirTerisi = 0;
       let dirKuota = 0;
       dir.dbId = dir.id;
       dir.id = `d${dIndex}`;

       (dir.fungsi || []).forEach((f: any, fIndex: number) => {
          let fTerisi = 0;
          let fKuota = 0;
          f.dbId = f.id;
          f.id = `f${dIndex}-${fIndex}`;

          (f.subFungsi || []).forEach((sf: any, sfIndex: number) => {
             sf.dbId = sf.id;
             sf.id = `sf${dIndex}-${fIndex}-${sfIndex}`;
             sf.kuota = sf.kuota || 0;
             
             let sfTerisi = 0;
             interns.forEach((internUser: any) => {
                const mentor = internUser.internProfile?.mentor;
                if (mentor && mentor.direktorat === dir.name && mentor.fungsi === f.name && mentor.subFungsi === sf.name) {
                   sfTerisi++;
                }
             });
             
             sf.terisi = sfTerisi;
             fTerisi += sfTerisi;
             fKuota += sf.kuota;
          });

          f.terisi = fTerisi;
          f.totalKuota = fKuota;
          dirTerisi += fTerisi;
          dirKuota += fKuota;
       });
       
       dir.terisi = dirTerisi;
       dir.totalKuota = dirKuota;
    });

    return mapped;
  }, [organizations, userSearchData]);


  const handleEditDir = (dir: any) => {
    setSelectedDir(dir);
    setDialogMode('edit_dir');
    setKuotaCount(dir.totalKuota || 0);
    setOpenQuotaDialog(true);
  };

  const handleEditFungsi = (fungsi: any) => {
    setSelectedFungsi(fungsi);
    setDialogMode('edit_fungsi');
    setSelectedSubFungsiId('');
    setKuotaCount(0);
    setOpenQuotaDialog(true);
  };

  const handleEditSubFungsi = (fungsi: any, subFungsi: any) => {
    setSelectedFungsi(fungsi);
    setSelectedSubFungsi(subFungsi);
    setDialogMode('edit_subfungsi');
    setKuotaCount(subFungsi.kuota || 0);
    setOpenQuotaDialog(true);
  };

  const handleSaveData = async () => {
    const dir = kuotaData.find((d: any) => d.id === expandedCard);
    const dirName = dir?.name || selectedDir?.name;
    const dirId = dir?.dbId || selectedDir?.dbId;
    if (!dirName || !dirId) return;

    try {
      if (dialogMode === 'edit_subfungsi' || dialogMode === 'edit_fungsi' || dialogMode === 'edit_dir') {
        let targetId = selectedSubFungsi?.dbId;
        if (dialogMode === 'edit_fungsi') {
          const sf = selectedFungsi?.subFungsi?.find((s: any) => s.id === selectedSubFungsiId);
          targetId = sf?.dbId;
        } else if (dialogMode === 'edit_dir') {
          targetId = selectedDir?.dbId;
        }
        if (targetId) {
          await axiosInstance.patch(endpoints.employeeProfile.updateKuota(targetId), { kuota: kuotaCount });
        }
      } else if (dialogMode === 'fungsi') {
        if (!newFungsiName) return;
        const res = await axiosInstance.post(endpoints.employeeProfile.addOrganization, {
          name: newFungsiName,
          parentId: dirId,
          kuota: 0,
        });
        const funcId = res.data?.id;
        if (newSubFungsiName && funcId) {
          await axiosInstance.post(endpoints.employeeProfile.addOrganization, {
            name: newSubFungsiName,
            parentId: funcId,
            kuota: kuotaCount,
          });
        }
      } else if (dialogMode === 'subfungsi') {
        if (!newSubFungsiName || !selectedFungsiId) return;
        const targetFungsi = dir.fungsi?.find((f: any) => f.id === selectedFungsiId);
        if (targetFungsi?.dbId) {
          await axiosInstance.post(endpoints.employeeProfile.addOrganization, {
            name: newSubFungsiName,
            parentId: targetFungsi.dbId,
            kuota: kuotaCount,
          });
        }
      }

      await fetchOrgs();

      setOpenQuotaDialog(false);
      setKuotaCount(0);
      setNewFungsiName('');
      setNewSubFungsiName('');
      setSelectedFungsiId('');
      setSelectedSubFungsiId('');
      toast.success('Berhasil menyimpan data organisasi!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan data organisasi.');
    }
  };

  const handleDeleteOrg = (id: string, name: string) => {
    setOrgToDelete({ id, name });
    setOpenDeleteConfirm(true);
  };

  const confirmDeleteOrg = async () => {
    if (!orgToDelete) return;
    try {
      await axiosInstance.delete(endpoints.employeeProfile.deleteOrganization(orgToDelete.id));
      await fetchOrgs();
      setOpenDeleteConfirm(false);
      setOrgToDelete(null);
      toast.success('Berhasil menghapus data organisasi!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus data organisasi.');
    }
  };

  const handleDeletePeserta = (peserta: any) => {
    setPesertaToDelete(peserta);
    setOpenDeletePesertaConfirm(true);
  };

  const confirmDeletePeserta = async () => {
    if (!pesertaToDelete) return;
    try {
      await axiosInstance.delete(endpoints.user.details(pesertaToDelete.id));
      if (refetchSearch) await refetchSearch();
      setOpenDeletePesertaConfirm(false);
      setPesertaToDelete(null);
      toast.success('Berhasil menghapus peserta!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus peserta.');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = (user: any) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveEditProfile = async () => {
    if (!selectedUser || !selectedUser.raw) return;

    // Pengecekan data wajib
    const requiredFields: any = {
      name: editFormData.name,
      phone: editFormData.phone,
      internId: editFormData.internId,
      dateOfBirth: editFormData.dateOfBirth,
      gender: editFormData.gender,
      university: editFormData.university,
      major: editFormData.major,
      program: editFormData.program,
      startDate: editFormData.startDate,
      endDate: editFormData.endDate,
    };
    
    const hasEmpty = Object.values(requiredFields).some(val => !val || (typeof val === 'string' && val.trim() === ''));
    if (hasEmpty) {
      toast.error('Harap isi semua kolom yang wajib diisi (*).');
      return;
    }

    setIsSavingEdit(true);
    try {
      const u = selectedUser.raw;
      let finalPhotoUrl = u.photoUrl;

      // If photoUrl is a File, upload it first
      if (editFormData.photoUrl && editFormData.photoUrl instanceof File) {
        const formData = new FormData();
        formData.append('file', editFormData.photoUrl);
        formData.append('folder', 'users');

        const uploadRes = await axiosInstance.post('/gcp-item/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalPhotoUrl = uploadRes.data.url;
      }

      // Update User
      await axiosInstance.patch(endpoints.user.edit(u.id), {
        name: editFormData.name,
        phone: editFormData.phone,
        photoUrl: finalPhotoUrl,
      });

      // Upload documentUrls if they are Files
      const uploadedUrls: string[] = [];
      const currentFiles = editFormData.documentUrls || [];
      for (const file of currentFiles) {
        if (file instanceof File) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'documents');
          const uploadRes = await axiosInstance.post('/gcp-item/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          uploadedUrls.push(uploadRes.data.url);
        } else if (typeof file === 'string') {
          uploadedUrls.push(file);
        }
      }

      // Update or Create InternProfile
      const internData: any = {
        userId: u.id,
        internId: editFormData.internId,
        university: editFormData.university,
        major: editFormData.major,
        program: editFormData.program,
        gender: editFormData.gender,
        mentorProfileId: selectedMentorToAssign?.employeeProfile?.id || undefined,
        bankName: editFormData.bankName,
        bankAccount: editFormData.bankAccount,
        documentUrls: uploadedUrls,
      };

      if (editFormData.dateOfBirth) internData.dateOfBirth = new Date(editFormData.dateOfBirth).toISOString();
      if (editFormData.startDate) internData.startDate = new Date(editFormData.startDate).toISOString();
      if (editFormData.endDate) internData.endDate = new Date(editFormData.endDate).toISOString();

      if (u.internProfile && u.internProfile.id) {
        await axiosInstance.patch(endpoints.internProfile.details(u.internProfile.id), internData);
      } else {
        await axiosInstance.post('/intern-profile', internData);
      }

      if (refetchSearch) await refetchSearch();
      setOpenEditDialog(false);
      setSelectedMentorToAssign(null);
      handleCloseDialog();
      toast.success('Berhasil menyimpan profil peserta!');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || 'Gagal menyimpan profil peserta.';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getVpName = (fungsi: string) => {
    if (!userSearchData || !Array.isArray(userSearchData) || !fungsi) return '-';
    const vp = userSearchData.find((u: any) => u.role === 'EMPLOYEE' && u.employeeProfile?.fungsi === fungsi);
    return vp ? vp.name : '-';
  };

  return (
    <ErrorBoundary>
      <Helmet>
        <title> Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Data Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total: {pesertaList.length} | Aktif: {pesertaList.filter((p: any) => p.status_aktif === 'Aktif').length} | Tidak Aktif: {pesertaList.filter((p: any) => p.status_aktif !== 'Aktif').length} | Direktorat: {kuotaData.length}
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}>
            <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Data
          </Button>
        </Box>

        {/* SUMMARY CARDS */}
        {activeTab === 'data_peserta' && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {kuotaData.map((dir: any, index: number) => {
                 const colors = [
                    { border: '#004F9F', bg: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', icon: 'solar:shield-check-bold-duotone', shadow: 'rgba(0,79,159,0.15)' },
                    { border: '#EC2028', bg: 'rgba(236, 32, 40, 0.1)', color: '#EC2028', icon: 'solar:settings-bold-duotone', shadow: 'rgba(236,32,40,0.15)' },
                    { border: '#8CC63F', bg: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', icon: 'solar:cart-large-bold-duotone', shadow: 'rgba(140,198,63,0.15)' },
                    { border: '#FFAB00', bg: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', icon: 'solar:calculator-bold-duotone', shadow: 'rgba(255,171,0,0.15)' },
                 ];
                 const theme = colors[index % colors.length];
                 const isExpanded = expandedCard === dir.id;
                 return (
                   <Grid item xs={12} sm={6} md={3} key={dir.id}>
                     <Card 
                       onClick={() => setExpandedCard(isExpanded ? null : dir.id)}
                       sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid', borderColor: isExpanded ? theme.border : '#e2e8f0', cursor: 'pointer', boxShadow: isExpanded ? `0px 4px 20px ${theme.shadow}` : 'none', borderBottom: `4px solid ${theme.border}`, transition: 'all 0.3s', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                         <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: theme.bg, color: theme.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                           <Iconify icon={theme.icon} width={24} />
                         </Box>
                         <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{dir.name.replace('Direktorat ', '')}</Typography>
                       </Box>
                       <Typography variant="caption" sx={{ position: 'absolute', top: 16, right: 16, color: isExpanded ? theme.color : 'text.disabled', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                         <span style={{ cursor: 'pointer' }} onClick={() => setExpandedCard(isExpanded ? null : dir.id)}>
                           Kelola Kuota <Iconify icon={isExpanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} sx={{ ml: 0.5, width: 16 }} />
                         </span>
                       </Typography>
                       <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                         <Typography variant="h3" sx={{ color: theme.color, fontWeight: 'bold' }}>{dir.terisi}</Typography>
                         <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ {dir.totalKuota} Peserta</Typography>
                       </Box>
                     </Card>
                   </Grid>
                 )
              })}
            </Grid>

            {/* EXPANDABLE QUOTA DETAILS */}
            <Collapse in={Boolean(expandedCard)} timeout="auto" unmountOnExit sx={{ mb: 4 }}>
              <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6">Struktur Organisasi & Kuota</Typography>
                    <Typography variant="body2" color="text.secondary">{kuotaData.find(d => d.id === expandedCard)?.name}</Typography>
                  </Box>
                  <Button variant="contained" color="primary" onClick={handleMenuClick} size="small" sx={{ borderRadius: 1.5 }}>
                    <Iconify icon="mingcute:add-line" sx={{ mr: 1 }} /> Tambah Data
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' } }}
                  >
                    <MenuItem onClick={() => { handleMenuClose(); setDialogMode('fungsi'); setOpenQuotaDialog(true); }}>
                      Tambah Fungsi
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); setDialogMode('subfungsi'); setOpenQuotaDialog(true); }}>
                      Tambah Sub-Fungsi
                    </MenuItem>
                  </Menu>
                </Box>
                <TableContainer>
                  <Table size="small" sx={{ tableLayout: 'fixed' }}>
                    <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                      <TableRow>
                        <TableCell width={50} />
                        <TableCell>Fungsi / Sub Fungsi</TableCell>
                        <TableCell align="center" width={120} sx={{ whiteSpace: 'nowrap' }}>Total Kuota</TableCell>
                        <TableCell align="center" width={100}>Terisi</TableCell>
                        <TableCell align="center" width={100}>Sisa</TableCell>
                        <TableCell align="center" width={120}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kuotaData.find(d => d.id === expandedCard)?.fungsi?.map((f: any) => (
                        <FungsiRow key={f.id} row={f} onEditFungsi={handleEditFungsi} onEditSubFungsi={handleEditSubFungsi} onDeleteOrg={handleDeleteOrg} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Collapse>
          </>
        )}

        {activeTab === 'perpanjangan' && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:documents-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Total Pengajuan</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>12</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Menunggu Persetujuan</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>5</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #22c55e', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Disetujui</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>6</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #ef4444', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Ditolak</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 'bold' }}>1</Typography>
                </Card>
              </Grid>
            </Grid>
        )}

        <Card sx={{ p: 3 }}>
          {/* TABS */}
          <Box sx={{ display: 'flex', mb: 4, borderBottom: '1px solid #e2e8f0' }}>
            <Button
              variant="text"
              onClick={() => setActiveTab('data_peserta')}
              sx={{
                pb: 1.5, pt: 1, px: 3, borderRadius: 0,
                color: activeTab === 'data_peserta' ? 'primary.main' : 'text.secondary',
                borderBottom: activeTab === 'data_peserta' ? '3px solid #004F9F' : '3px solid transparent',
                fontWeight: activeTab === 'data_peserta' ? 'bold' : 'normal',
                fontSize: '1rem',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' }
              }}>
              Data Peserta
            </Button>
            <Button
              variant="text"
              onClick={() => setActiveTab('perpanjangan')}
              sx={{
                pb: 1.5, pt: 1, px: 3, borderRadius: 0,
                color: activeTab === 'perpanjangan' ? 'primary.main' : 'text.secondary',
                borderBottom: activeTab === 'perpanjangan' ? '3px solid #004F9F' : '3px solid transparent',
                fontWeight: activeTab === 'perpanjangan' ? 'bold' : 'normal',
                fontSize: '1rem',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' }
              }}>
              Perpanjangan
            </Button>
          </Box>

          {activeTab === 'data_peserta' && (
            <>
              {/* FILTERS FOR DATA PESERTA */}
              <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Program</InputLabel><Select label="Program" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}><MenuItem value="all">Semua Program</MenuItem>
                      {uniquePrograms.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Status</InputLabel><Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><MenuItem value="all">Semua Status</MenuItem><MenuItem value="aktif">Aktif</MenuItem><MenuItem value="tidak_aktif">Tidak Aktif</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Direktorat</InputLabel><Select label="Direktorat" value={filterDir} onChange={(e) => { setFilterDir(e.target.value); setFilterFungsi('all'); setFilterSubFungsi('all'); setFilterMentor('all'); }}><MenuItem value="all">Semua Direktorat</MenuItem>
                      {uniqueDirs.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Fungsi</InputLabel><Select label="Fungsi" value={filterFungsi} onChange={(e) => { setFilterFungsi(e.target.value); setFilterSubFungsi('all'); setFilterMentor('all'); }}><MenuItem value="all">Semua Fungsi</MenuItem>
                      {uniqueFungsi.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                    </Select></FormControl>
                  </Grid>

                  {/* Row 2 */}
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Sub Fungsi</InputLabel><Select label="Sub Fungsi" value={filterSubFungsi} onChange={(e) => { setFilterSubFungsi(e.target.value); setFilterMentor('all'); }}><MenuItem value="all">Semua Sub Fungsi</MenuItem>
                      {uniqueSubFungsi.map(sf => <MenuItem key={sf} value={sf}>{sf}</MenuItem>)}
                    </Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Mentor</InputLabel><Select label="Mentor" value={filterMentor} onChange={(e) => setFilterMentor(e.target.value)}><MenuItem value="all">Semua Mentor</MenuItem>
                      {uniqueMentors.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" placeholder="Cari nama peserta atau ID..." sx={{ bgcolor: 'white' }} value={searchQueryPeserta} onChange={(e) => setSearchQueryPeserta(e.target.value)} />
                    <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                      <Iconify icon="eva:search-fill" />
                    </Button>
                    <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }} onClick={() => { setFilterProgram('all'); setFilterStatus('all'); setFilterDir('all'); setFilterFungsi('all'); setFilterSubFungsi('all'); setFilterMentor('all'); setSearchQueryPeserta(''); setPage(0); }}>
                      Reset
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* TABLE FOR DATA PESERTA */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Peserta</TableCell>
                      <TableCell>Program & Instansi</TableCell>
                      <TableCell>Penempatan</TableCell>
                      <TableCell>Mentor</TableCell>
                      <TableCell>Periode</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchLoading ? (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 3 }}>Memuat data peserta...</TableCell>
                      </TableRow>
                    ) : filteredPesertaList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 3 }}>Belum ada data peserta yang sesuai filter.</TableCell>
                      </TableRow>
                    ) : (
                      filteredPesertaList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{row.nim}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">{row.program}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.kampus}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">{row.direktorat}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.fungsi} • {row.subFungsi}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.mentor}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{row.periode}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={row.status_aktif} size="small" color={row.status_aktif === 'Aktif' ? 'success' : 'default'} variant="soft" sx={{ fontWeight: 'bold' }} />
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                            <IconButton size="small" color="primary" sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} onClick={() => handleOpenDialog(row)} title="Detail / Edit">
                            <Iconify icon="solar:eye-bold-duotone" width={20} />
                          </IconButton>
                          <IconButton size="small" color="error" title="Hapus" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} onClick={() => handleDeletePeserta(row)}>
                            <Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredPesertaList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}

          {activeTab === 'perpanjangan' && (
            <>
              {/* FILTERS FOR PERPANJANGAN */}
              <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Status Pengajuan</InputLabel><Select label="Status Pengajuan" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem><MenuItem value="menunggu">Menunggu</MenuItem><MenuItem value="disetujui">Disetujui</MenuItem><MenuItem value="ditolak">Ditolak</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Program</InputLabel><Select label="Program" defaultValue="all"><MenuItem value="all">Semua Program</MenuItem><MenuItem value="pkl">PKL</MenuItem><MenuItem value="internship_ptpl">Internship PTPL</MenuItem><MenuItem value="internship_kemnaker">Internship Kemnaker</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" placeholder="Cari nama atau ID peserta..." sx={{ bgcolor: 'white' }} />
                    <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                      <Iconify icon="eva:search-fill" />
                    </Button>
                    <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                      Reset
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* TABLE FOR PERPANJANGAN */}
              <TableContainer sx={{ minHeight: 400 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                    <TableRow>
                      <TableCell>Nama Peserta</TableCell>
                      <TableCell>ID Peserta</TableCell>
                      <TableCell>Program</TableCell>
                      <TableCell>Periode Lama</TableCell>
                      <TableCell>Pengajuan Periode Baru</TableCell>
                      <TableCell>Alasan</TableCell>
                      <TableCell>Dokumen Pendukung</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DUMMY_PERPANJANGAN.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.name}
                        </TableCell>
                        <TableCell>{row.nim}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.program}</Typography>
                        </TableCell>
                        <TableCell>{row.periodeLama}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{row.periodeBaru}</TableCell>
                        <TableCell>{row.alasan}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                            Lihat Dokumen
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" color={row.status === 'Disetujui' ? 'success' : row.status === 'Menunggu' ? 'warning' : 'error'} variant="soft" />
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <IconButton size="small" color="primary" sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} title="Detail / Edit">
                            <Iconify icon="solar:eye-bold-duotone" width={20} />
                          </IconButton>
                          <IconButton size="small" color="error" title="Hapus" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }}>
                            <Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

        </Card>
      </Container>

      {/* DETAIL DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedUser && (
          <>
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Detail Peserta</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedUser.name}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 5, bgcolor: '#f8fafc' }}>
              
              {/* Data Diri */}
              <Box sx={{ mb: 2.5, mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Data Diri
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">ID Peserta</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.nim}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Tanggal Lahir</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.tglLahir}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Jurusan</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedUser.jurusan}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Jenis Kelamin</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.kelamin}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Kontak</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.kontak}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Asal Instansi</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedUser.kampus}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

              {/* Informasi Magang */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:case-round-bold-duotone" sx={{ mr: 1 }} /> Informasi
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Periode</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.periode}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Direktorat</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.direktorat}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Sub Fungsi</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.subFungsi}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Status</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip label={selectedUser.status_aktif} size="small" color={selectedUser.status_aktif === 'Aktif' ? 'success' : 'default'} variant="soft" sx={{ fontWeight: 'bold' }} />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Nama Mentor</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.mentor}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Fungsi</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.fungsi}</Typography>


                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Program</Typography>
                      <Box sx={{ mt: 0.5, mb: 1 }}>
                        <Chip label={selectedUser.program} size="small" color={selectedUser.program === 'PKL' ? 'warning' : selectedUser.program === 'Internship PTPL' ? 'info' : 'primary'} variant="soft" sx={{ fontWeight: 'bold' }} />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

              {/* Rekening & Berkas (Kiri Kanan) */}
              <Grid container spacing={2.5}>
                {/* Rekening */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="solar:card-bold-duotone" sx={{ mr: 1 }} /> Rekening
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)', height: 'calc(100% - 36px)' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Bank</Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.bank}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Nomor Rekening</Typography>
                          <Typography variant="body2" fontWeight="bold">{selectedUser.noRek}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>

                {/* Berkas */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="solar:folder-with-files-bold-duotone" sx={{ mr: 1 }} /> Berkas
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)', height: 'calc(100% - 36px)' }}>
                      {(selectedUser.dokumen || []).length > 0 ? (
                        <Stack spacing={1}>
                          {(selectedUser.dokumen || []).map((doc: string, idx: number) => {
                            let fileName = doc;
                            if (typeof doc === 'string') {
                              fileName = doc.split('/').pop() || '';
                              try { fileName = decodeURIComponent(fileName); } catch (e) {}
                              fileName = fileName.replace(/^\d+_/, '');
                              if (fileName.length > 30) {
                                const parts = fileName.split('.');
                                const ext = parts.length > 1 ? `.${  parts.pop()}` : '';
                                const base = parts.join('.');
                                fileName = `${base.substring(0, 25)  }...${  ext}`;
                              }
                            }
                            return (
                              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px dashed #cbd5e1' }}>
                                <Iconify icon="solar:document-bold" sx={{ mr: 1.5, color: 'primary.main' }} />
                                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 'medium', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 2 }}>{fileName}</Typography>
                                <Button size="small" variant="contained" color="primary" sx={{ boxShadow: 'none' }} component="a" href={doc} target="_blank" rel="noopener noreferrer">Lihat</Button>
                              </Box>
                            );
                          })}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">- Tidak ada berkas -</Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, bgcolor: '#f8fafc' }}>
              <Button onClick={handleCloseDialog} variant="contained" sx={{ bgcolor: '#e2e8f0', color: '#475569', '&:hover': { bgcolor: '#cbd5e1' }, boxShadow: 'none' }}>
                Tutup
              </Button>
              <Button variant="contained" color="primary" sx={{ boxShadow: 'none' }} onClick={() => {
                if (selectedUser && selectedUser.raw) {
                  const u = selectedUser.raw;
                  const intern = u.internProfile || {};
                  const toYYYYMMDD = (iso: string) => iso ? new Date(iso).toISOString().split('T')[0] : '';
                  
                  setEditFormData({
                    name: u.name || '',
                    phone: u.phone || '',
                    internId: intern.internId || '',
                    dateOfBirth: toYYYYMMDD(intern.dateOfBirth),
                    gender: intern.gender || '',
                    university: intern.university || '',
                    major: intern.major || '',
                    program: intern.program || '',
                    startDate: toYYYYMMDD(intern.startDate),
                    endDate: toYYYYMMDD(intern.endDate),
                    bankName: intern.bankName || '',
                    bankAccount: intern.bankAccount || '',
                    documentUrls: intern.documentUrls || [],
                    photoUrl: u.photoUrl || null,
                  });
                  
                  const currentMentor = Array.isArray(userSearchData) ? userSearchData.find((m: any) => m.employeeProfile?.id === intern.mentorProfileId) : null;
                  setSelectedMentorToAssign(currentMentor || null);
                  setOpenEditDialog(true);
                }
              }}>
                Edit Profile
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:pen-bold-duotone" width={24} />
            </Box>
            <Typography variant="h6" fontWeight="bold">Edit Profile Peserta</Typography>
          </Box>
          <IconButton onClick={() => setOpenEditDialog(false)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: '24px !important' }}>
          <Stack spacing={3}>
            {/* Akun, Kontak & Akademik */}
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Informasi Pribadi, Kontak & Akademik
              </Typography>
              
              <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <UploadAvatar
                  file={editFormData.photoUrl}
                  maxSize={3145728}
                  onDrop={(acceptedFiles) => {
                    const file = acceptedFiles[0];
                    if (file) {
                      setEditFormData({
                        ...editFormData,
                        photoUrl: Object.assign(file, {
                          preview: URL.createObjectURL(file),
                        }),
                      });
                    }
                  }}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 2,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br /> max size of {fData(3145728)}
                    </Typography>
                  }
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="Nama Lengkap" required value={editFormData.name || ''} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="Kontak / No HP" required value={editFormData.phone || ''} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="ID Peserta / NIM" required value={editFormData.internId || ''} onChange={(e) => setEditFormData({ ...editFormData, internId: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" type="date" label="Tanggal Lahir" required InputLabelProps={{ shrink: true }} value={editFormData.dateOfBirth || ''} onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Jenis Kelamin</InputLabel>
                    <Select label="Jenis Kelamin" value={editFormData.gender || ''} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}>
                      <MenuItem value="PRIA">Laki-laki</MenuItem>
                      <MenuItem value="WANITA">Perempuan</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="Asal Instansi / Universitas" required value={editFormData.university || ''} onChange={(e) => setEditFormData({ ...editFormData, university: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Jurusan" required value={editFormData.major || ''} onChange={(e) => setEditFormData({ ...editFormData, major: e.target.value })} />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Informasi Magang */}
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:case-round-bold-duotone" sx={{ mr: 1 }} /> Informasi Magang
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Program Magang</InputLabel>
                    <Select label="Program Magang" value={editFormData.program || ''} onChange={(e) => setEditFormData({ ...editFormData, program: e.target.value })}>
                      <MenuItem value="PKL">PKL</MenuItem>
                      <MenuItem value="Internship PTPL">Internship PTPL</MenuItem>
                      <MenuItem value="Internship Kemnaker">Internship Kemnaker</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" type="date" label="Tanggal Mulai" required InputLabelProps={{ shrink: true }} value={editFormData.startDate || ''} onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" type="date" label="Tanggal Selesai" required InputLabelProps={{ shrink: true }} value={editFormData.endDate || ''} onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Penugasan Mentor</Typography>
                  <Autocomplete
                    options={Array.isArray(userSearchData) ? userSearchData.filter((u: any) => u?.role === 'EMPLOYEESTAFF') : []}
                    getOptionLabel={(option) => `${option?.name || 'Unknown'}`}
                    value={selectedMentorToAssign}
                    onChange={(event, newValue) => setSelectedMentorToAssign(newValue)}
                    renderInput={(params) => <TextField {...params} size="small" label="Cari Mentor..." placeholder="Ketik nama mentor" />}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{option.employeeProfile?.jabatan || '-'} • {option.employeeProfile?.fungsi || '-'}</Typography>
                          </Box>
                        </li>
                      )}
                  />
                  {selectedMentorToAssign && selectedMentorToAssign.employeeProfile && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px dashed #cbd5e1' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>Data Organisasi (Diikuti dari Mentor)</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Typography variant="body2"><Box component="span" fontWeight="medium" color="text.secondary" sx={{ width: 80, display: 'inline-block' }}>Direktorat:</Box> {selectedMentorToAssign.employeeProfile.direktorat || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2"><Box component="span" fontWeight="medium" color="text.secondary" sx={{ width: 80, display: 'inline-block' }}>Fungsi:</Box> {selectedMentorToAssign.employeeProfile.fungsi || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2"><Box component="span" fontWeight="medium" color="text.secondary" sx={{ width: 80, display: 'inline-block' }}>Sub Fungsi:</Box> {selectedMentorToAssign.employeeProfile.subFungsi || '-'}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Informasi Pembayaran */}
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:wallet-money-bold-duotone" sx={{ mr: 1 }} /> Informasi Pembayaran
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="Nama Bank" placeholder="Contoh: BCA, Mandiri" value={editFormData.bankName || ''} onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth size="small" label="Nomor Rekening" value={editFormData.bankAccount || ''} onChange={(e) => setEditFormData({ ...editFormData, bankAccount: e.target.value })} />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Berkas */}
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:document-bold-duotone" sx={{ mr: 1 }} /> Berkas
              </Typography>
              <Upload
                multiple
                files={editFormData.documentUrls || []}
                onDrop={(acceptedFiles) => {
                  const newFiles = acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) }));
                  setEditFormData({ ...editFormData, documentUrls: [...(editFormData.documentUrls || []), ...newFiles] });
                }}
                onRemove={(inputFile) => {
                  const filtered = (editFormData.documentUrls || []).filter((file: any) => file !== inputFile);
                  setEditFormData({ ...editFormData, documentUrls: filtered });
                }}
                onRemoveAll={() => setEditFormData({ ...editFormData, documentUrls: [] })}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end' }}>
          <Button onClick={() => setOpenEditDialog(false)} variant="outlined" color="inherit" sx={{ minWidth: 100 }}>
            Batal
          </Button>
          <Button onClick={handleSaveEditProfile} variant="contained" color="primary" sx={{ minWidth: 100, boxShadow: 'none' }} disabled={isSavingEdit}>
            {isSavingEdit ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* TAMBAH / EDIT FUNGSI / SUB FUNGSI DIALOG */}
      <Dialog open={openQuotaDialog} onClose={() => setOpenQuotaDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24 }}>
              <Iconify icon={dialogMode.includes('edit') ? "solar:pen-bold-duotone" : "solar:add-circle-bold-duotone"} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {dialogMode === 'fungsi' ? 'Tambah Fungsi' : 
                 dialogMode === 'subfungsi' ? 'Tambah Sub-Fungsi' : 
                 dialogMode === 'edit_dir' ? 'Edit Direktorat' : 
                 dialogMode === 'edit_fungsi' ? 'Edit Fungsi' : 'Edit Sub-Fungsi'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Manajemen Struktur Organisasi
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setOpenQuotaDialog(false)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 5, bgcolor: '#f8fafc' }}>
          <Box sx={{ mt: 4, mb: 0 }}>
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
              <Stack spacing={3}>
                {dialogMode !== 'edit_dir' && (
                  <TextField 
                    fullWidth size="small" 
                    label="Nama Direktorat" 
                    value={kuotaData.find((d: any) => d.id === expandedCard)?.name || 'Pilih Direktorat'} 
                    InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', color: 'text.secondary' } }} 
                  />
                )}

                {dialogMode === 'fungsi' && (
                  <Stack spacing={3}>
                    <TextField fullWidth size="small" label="Nama Fungsi Baru" placeholder="Masukkan nama fungsi..." value={newFungsiName} onChange={(e) => setNewFungsiName(e.target.value)} />
                    <TextField fullWidth size="small" label="Nama Sub-Fungsi (Opsional)" placeholder="Masukkan nama sub-fungsi..." value={newSubFungsiName} onChange={(e) => setNewSubFungsiName(e.target.value)} />
                  </Stack>
                )}

                {dialogMode === 'subfungsi' && (
                  <Stack spacing={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Pilih Fungsi</InputLabel>
                      <Select label="Pilih Fungsi" value={selectedFungsiId} onChange={(e) => setSelectedFungsiId(e.target.value)}>
                        {kuotaData.find((d: any) => d.id === expandedCard)?.fungsi?.map((f: any) => (
                          <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField fullWidth size="small" label="Nama Sub-Fungsi Baru" placeholder="Masukkan nama sub-fungsi..." value={newSubFungsiName} onChange={(e) => setNewSubFungsiName(e.target.value)} required />
                  </Stack>
                )}

                {dialogMode === 'edit_dir' && (
                  <Stack spacing={3}>
                    <TextField fullWidth size="small" label="Nama Direktorat" value={selectedDir?.name || ''} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', color: 'text.secondary' } }} />
                  </Stack>
                )}

                {dialogMode === 'edit_fungsi' && (
                  <Stack spacing={3}>
                    <TextField fullWidth size="small" label="Nama Fungsi" value={selectedFungsi?.name || ''} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', color: 'text.secondary' } }} />
                    <FormControl fullWidth size="small">
                      <InputLabel>Pilih Sub-Fungsi</InputLabel>
                      <Select label="Pilih Sub-Fungsi" value={selectedSubFungsiId} onChange={(e) => {
                         setSelectedSubFungsiId(e.target.value);
                         const sf = selectedFungsi?.subFungsi?.find((s: any) => s.id === e.target.value);
                         if (sf) setKuotaCount(sf.kuota);
                      }}>
                        {selectedFungsi?.subFungsi?.map((sf: any) => (
                          <MenuItem key={sf.id} value={sf.id}>{sf.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                )}

                {dialogMode === 'edit_subfungsi' && (
                  <Stack spacing={3}>
                    <TextField fullWidth size="small" label="Nama Fungsi" value={selectedFungsi?.name || ''} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', color: 'text.secondary' } }} />
                    <TextField fullWidth size="small" label="Nama Sub-Fungsi" value={selectedSubFungsi?.name || ''} InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc', color: 'text.secondary' } }} />
                  </Stack>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', borderRadius: 1, p: 1.5, mt: 1 }}>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>Kapasitas Peserta</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setKuotaCount(Math.max(0, kuotaCount - 1))} sx={{ border: '1px solid #e2e8f0', borderRadius: 1 }}><Iconify icon="eva:minus-fill" /></IconButton>
                    <Typography sx={{ mx: 3, fontWeight: 'bold' }}>{kuotaCount}</Typography>
                    <IconButton size="small" onClick={() => setKuotaCount(kuotaCount + 1)} sx={{ border: '1px solid #e2e8f0', borderRadius: 1 }}><Iconify icon="eva:plus-fill" /></IconButton>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setOpenQuotaDialog(false)} variant="contained" sx={{ bgcolor: '#e2e8f0', color: '#475569', '&:hover': { bgcolor: '#cbd5e1' }, boxShadow: 'none' }}>
            Batal
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveData} sx={{ boxShadow: 'none' }}>
            Simpan Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE DIALOG FOR ORG */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:danger-triangle-bold-duotone" width={24} />
            </Box>
            <Typography variant="h6" fontWeight="bold">Konfirmasi Hapus</Typography>
          </Box>
          <IconButton onClick={() => setOpenDeleteConfirm(false)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: '40px !important' }}>
          <Typography variant="body1" textAlign="center">
            Apakah Anda yakin ingin menghapus <strong style={{ color: '#ef4444' }}>{orgToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)} variant="outlined" color="inherit" sx={{ minWidth: 120 }}>
            Batal
          </Button>
          <Button onClick={confirmDeleteOrg} variant="contained" color="error" sx={{ minWidth: 120, boxShadow: 'none' }}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE DIALOG FOR PESERTA */}
      <Dialog open={openDeletePesertaConfirm} onClose={() => setOpenDeletePesertaConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:danger-triangle-bold-duotone" width={24} />
            </Box>
            <Typography variant="h6" fontWeight="bold">Konfirmasi Hapus</Typography>
          </Box>
          <IconButton onClick={() => setOpenDeletePesertaConfirm(false)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: '40px !important' }}>
          <Typography variant="body1" textAlign="center">
            Apakah Anda yakin ingin menghapus peserta <strong style={{ color: '#ef4444' }}>{pesertaToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            Tindakan ini akan menghapus data peserta sepenuhnya dari sistem dan tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenDeletePesertaConfirm(false)} variant="outlined" color="inherit" sx={{ minWidth: 120 }}>
            Batal
          </Button>
          <Button onClick={confirmDeletePeserta} variant="contained" color="error" sx={{ minWidth: 120, boxShadow: 'none' }}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
}