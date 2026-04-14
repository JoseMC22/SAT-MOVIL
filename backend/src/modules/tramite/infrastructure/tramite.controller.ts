import { Controller, Get, Req } from '@nestjs/common';
import { GetTramitesUseCase } from '../application/get-tramites.use-case.js';


@Controller('tramite')
export class TramiteController {
    constructor(private readonly getTramitesUseCase: GetTramitesUseCase) { }


    @Get()
    async getMyTramites(@Req() req: any) {
        // Extract DNI from JWT user object (injected by JwtAuthGuard)
        const dni = req.user.dni;
        return this.getTramitesUseCase.execute(dni);
    }
}
