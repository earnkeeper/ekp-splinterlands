import {
  Button,
  Form,
  formatTemplate,
  hideModal,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Span,
} from '@earnkeeper/ekp-sdk';

export const PROMPT_DECK_NAME_MODAL_ID = 'splinterlands-prompt-deck-name';

export function promptDeckNameModal(): any {
  return Modal({
    id: PROMPT_DECK_NAME_MODAL_ID,
    centered: true,
    size: 'md',
    children: [
      ModalHeader({
        children: [Span({ content: 'Save Team' })],
      }),
      ModalBody({
        children: [
          Form({
            name: 'savedTeams',
            onSubmit: hideModal(PROMPT_DECK_NAME_MODAL_ID),
            schema: {
              type: 'object',
              properties: {
                id: 'string',
                teamName: 'string',
                edition: 'string',
                mana: 'number',
                monsterCount: 'number',
                splinter: 'string',
                summonerIcon: 'string',
                summonerCardImg: 'string',
                summonerEdition: 'string',
                summonerName: 'string',
                monsters: 'array',
              },
              default: {
                id: '$.id',
                teamName: formatTemplate('{{ summonerName }} Team', {
                  summonerName: '$.summonerName',
                }),
                edition: '$.edition',
                mana: '$.mana',
                monsterCount: '$.monsterCount',
                splinter: '$.splinter',
                summonerCardImg: '$.summonerCardImg',
                summonerEdition: '$.summonerEdition',
                summonerIcon: '$.summonerIcon',
                summonerName: '$.summonerName',
                monsters: '$.monsters',
              },
              required: ['teamName'],
            },
            multiRecord: {
              idField: 'teamName',
            },
            children: [
              Input({
                label: 'Choose a name to save your team under',
                name: 'teamName',
              }),
              Button({
                className: 'mb-1',
                label: 'Save',
                isSubmit: true,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
