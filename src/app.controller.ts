import { Controller, Get, UseGuards } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators/core/exception-filters.decorator';
import { AppService } from './app.service';
import { UnauthorizedExceptionFilter } from './filters';
import { JwtGuard } from './guard/jwt.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtGuard)
  @UseFilters(UnauthorizedExceptionFilter)
  getHello(): string {
    return this.appService.getHello();
  }
}
