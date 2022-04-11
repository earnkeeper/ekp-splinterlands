import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { MarketService } from '../../shared/game';
import { PlannerForm } from '../../util';
import { DeckDocument } from './ui/deck.document';

@Injectable()
export class DecksService {
  constructor(private marketService: MarketService) {}

  async updateTeams(
    clientTeams: DeckDocument[],
    form: PlannerForm,
    currency: CurrencyDto,
  ) {
    return await this.mapDocuments(clientTeams, currency);
  }

  async mapDocuments(clientTeams: DeckDocument[], currency: CurrencyDto) {
    const now = moment().unix();

    const conversionRate = await this.marketService.getConversionRate(
      'usd-coin',
      currency.id,
    );

    const deckDocuments: DeckDocument[] = clientTeams.map((clientDocument) => {
      const document: DeckDocument = {
        ...clientDocument,
        fiatSymbol: currency.symbol,
        monsters: clientDocument.monsters,
        price: _.chain(clientDocument.monsters)
          .map((it) => it.price)
          .filter((it) => !!it)
          .sum()
          .thru((it) => it * conversionRate)
          .value(),
        updated: now,
      };

      return document;
    });

    return deckDocuments;
  }
}
