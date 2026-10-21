import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { SearchUserDto } from './dto/search-user-item.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll() {
    return this.userService.findAll({});
  }

  @Post('/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: SearchUserDto, required: false })
  async findByTeamId(@Body() search?: SearchUserDto) {
    const { skip, take, orderBy, cursor, where } = search || {};
    return this.userService.findAll({
      where,
      orderBy,
      take,
      skip,
      cursor,
    });
  }

  @Post('/sync-idaman')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async syncIdaman() {
    const token = await this.userService.getTokenIdaman();
    await this.userService.syncIdamanOrganization(token.access_token);
    await this.userService.syncIdamanUser(token.access_token);
    return this.userService.syncTeamBasedOnOrganization();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('manager-team-check/:email')
  async findByEmailmanager(@Param('email') email: string) {
    return this.userService.findByEmailmanager(email);
  }

  @Patch('change-password-by-admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updatePasswordByAdmin(@Body() updatePasswordDto: { userId: string; newPassword: string }) {
    return this.userService.updatePasswordByAdmin(
      updatePasswordDto.userId,
      updatePasswordDto.newPassword
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('edit-webauthn/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateWebAuthn(
    @Param('id') id: string,
    @Body()
    updateUserDto: {
      webAuthnId: string;
    }
  ) {
    return this.userService.updateWebAuthn(id, updateUserDto.webAuthnId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
