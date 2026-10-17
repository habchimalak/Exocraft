import { Controller, Get } from '@nestjs/common'
import { StatsService } from './stats.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'

@Controller('stats')
@Roles('admin')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats(@CurrentUser() user: { etablissementType: string }) {
    return this.statsService.getStats(user.etablissementType)
  }
}
