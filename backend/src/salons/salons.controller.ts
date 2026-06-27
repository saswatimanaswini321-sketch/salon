import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { SalonsService } from './salons.service';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('admin/salons')
@UseGuards(SuperAdminGuard) // Protect all routes with Super Admin Guard
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @Get()
  async findAll() {
    return this.salonsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salonsService.findOne(id);
  }

  @Post()
  async create(@Body() createData: { name: string; ownerId: string; ownerName?: string; email?: string; mobile?: string; subscriptionId?: string }) {
    if (!createData.name || !createData.ownerId) {
      throw new BadRequestException('Name and OwnerId are required');
    }
    return this.salonsService.create(createData);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string, 
    @Body() updateData: { name?: string; ownerName?: string; email?: string; mobile?: string; subscriptionId?: string; gstNumber?: string }
  ) {
    return this.salonsService.updateProfile(id, updateData);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    return this.salonsService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.salonsService.remove(id);
  }

  // === BRANCH MANAGEMENT ROUTES ===

  @Get(':salonId/branches')
  async getBranches(@Param('salonId') salonId: string) {
    return this.salonsService.getBranches(salonId);
  }

  @Put(':salonId/branches/:branchId')
  async updateBranch(
    @Param('salonId') salonId: string, 
    @Param('branchId') branchId: string, 
    @Body() updateData: { address?: string; timings?: string; name?: string }
  ) {
    return this.salonsService.updateBranch(salonId, branchId, updateData);
  }

  @Get(':salonId/branches/:branchId/staff')
  async getBranchStaff(
    @Param('salonId') salonId: string, 
    @Param('branchId') branchId: string
  ) {
    return this.salonsService.getBranchStaff(salonId, branchId);
  }
}
