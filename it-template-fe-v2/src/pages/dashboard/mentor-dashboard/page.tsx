import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack, Chip,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSearchUsers } from 'src/pages/user-mgmt/query';

// ----------------------------------------------------------------------

export default function MentorDashboardPage() {
  const { user } = useAuthContext();
  const { userSearchData } = useSearchUsers('');

  const myInterns = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData) || !user) return [];
    return userSearchData.filter((u: any) =>
      u?.role === 'PESERTA' &&
      u?.internProfile?.mentor?.userId === user.id
    );
  }, [userSearchData, user]);

  const activeInterns = myInterns.filter((u: any) => u.status === 'active');
  const pendingInterns = myInterns.filter((u: any) => u.status === 'pending');

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const summaryCards = [
    {
      title: 'Total Peserta Bimbingan',
      value: myInterns.length,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: '#004F9F',
      bg: 'rgba(0, 79, 159, 0.1)',
    },
    {
      title: 'Peserta Aktif',
      value: activeInterns.length,
      icon: 'solar:check-circle-bold-duotone',
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)',
    },
    {
      title: 'Menunggu Aktivasi',
      value: pendingInterns.length,
      icon: 'solar:clock-circle-bold-duotone',
      color: '#FFAB00',
      bg: 'rgba(255, 171, 0, 0.1)',
    },
    {
      title: 'Program Terdaftar',
      value: new Set(myInterns.map((u: any) => u.internProfile?.program).filter(Boolean)).size,
      icon: 'solar:document-text-bold-duotone',
      color: '#EC2028',
      bg: 'rgba(236, 32, 40, 0.1)',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard Mentor | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:home-2-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Selamat Datang, {user?.name || 'Mentor'}!</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Dashboard Mentor — Kelola peserta bimbingan Anda
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: `4px solid ${card.color}`, '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Iconify icon={card.icon} width={24} />
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>{card.title}</Typography>
                </Box>
                <Typography variant="h3" sx={{ color: card.color, fontWeight: 'bold' }}>{card.value}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* DAFTAR PESERTA BIMBINGAN */}
        <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6">Peserta Bimbingan Anda</Typography>
              <Typography variant="body2" color="text.secondary">Ringkasan peserta yang sedang Anda bimbing</Typography>
            </Box>
          </Box>

          {myInterns.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">Belum ada peserta bimbingan</Typography>
              <Typography variant="body2" color="text.disabled">Peserta akan muncul di sini setelah ditugaskan kepada Anda</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {myInterns.map((intern: any) => {
                const profile = intern.internProfile || {};
                return (
                  <Grid item xs={12} sm={6} md={4} key={intern.id}>
                    <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none', '&:hover': { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' } }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1" fontWeight="bold">{intern.name}</Typography>
                          <Chip
                            label={intern.status === 'active' ? 'Aktif' : 'Pending'}
                            size="small"
                            color={intern.status === 'active' ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          <Iconify icon="solar:buildings-bold-duotone" sx={{ mr: 0.5, width: 16, verticalAlign: 'text-bottom' }} />
                          {profile.university || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <Iconify icon="solar:notebook-bold-duotone" sx={{ mr: 0.5, width: 16, verticalAlign: 'text-bottom' }} />
                          {profile.major || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <Iconify icon="solar:calendar-date-bold-duotone" sx={{ mr: 0.5, width: 16, verticalAlign: 'text-bottom' }} />
                          {formatDate(profile.startDate)} — {formatDate(profile.endDate)}
                        </Typography>
                        <Chip 
                          label={profile.program || '-'} 
                          size="small" 
                          variant="soft" 
                          color={profile.program?.toLowerCase().includes('pkl') ? 'warning' : profile.program?.toLowerCase().includes('kemnaker') ? 'success' : 'info'} 
                          sx={{ alignSelf: 'flex-start', fontWeight: 'bold' }} 
                        />
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Card>
      </Container>
    </>
  );
}
