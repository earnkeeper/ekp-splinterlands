import { Injectable } from '@nestjs/common';
import { ApiService } from '../../shared/api';
import { CardRepository } from '../../shared/db/card/card.repository';
import { GameService } from '../../shared/game/game.service';

@Injectable()
export class DecksService {
  constructor(
    private apiService: ApiService,
    private cardRepository: CardRepository,
    private gameService: GameService,
  ) {}
}
