import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { GetTramitesUseCase } from '../application/get-tramites.use-case.js';
import { GuestLimitGuard } from '../../auth/infrastructure/guest-limit.guard.js';


@Controller('tramite')
export class TramiteController {
    constructor(private readonly getTramitesUseCase: GetTramitesUseCase) { }


    @UseGuards(GuestLimitGuard)
    @Get()
    async getMyTramites(@Req() req: any, @Query('dni') queryDni?: string) {
        // Extract DNI from JWT user object or from query if guest
        const dni = req.user.isGuest ? queryDni : req.user.dni;
        
        if (!dni) return [];
        
        return this.getTramitesUseCase.execute(dni);
    }
}
