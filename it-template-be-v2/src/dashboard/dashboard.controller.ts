import { Body, Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('post-clicks/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findPostClickDashboard(@Param('teamId') teamId: string) {
    return await this.dashboardService.findPostClickDashboard(teamId);
  }

  @Get('post-clicks-by-author/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findPostClickDashboardByAuthor(@Param('teamId') teamId: string) {
    return await this.dashboardService.findPostClickDashboardByAuthor(teamId);
  }

  @Get('post-by-author/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findPostDashboardByAuthor(@Param('teamId') teamId: string) {
    return await this.dashboardService.findPostDashboardByAuthor(teamId);
  }

  @Get('post-click-conversion/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findPostDashboardConversion(@Param('teamId') teamId: string) {
    return await this.dashboardService.findPostDashboardConversion(teamId);
  }

  @Get('post-by-active-members/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findPostDashboardActiveUsers(@Param('teamId') teamId: string) {
    return await this.dashboardService.findPostDashboardActiveUsers(teamId);
  }

  @Get('post-clicks-yearly/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findPostClickDashboardYearly(@Param('teamId') teamId: string) {
    return await this.dashboardService.findPostClickDashboardYearly(teamId);
  }

  @Get('user-clicks-yearly/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findUserClickDashboardYearly(@Param('teamId') teamId: string) {
    return await this.dashboardService.findUserClickDashboardYearly(teamId);
  }
}
