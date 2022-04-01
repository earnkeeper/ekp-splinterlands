import {
  Button,
  Form,
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
                mana: 'number',
                monsterCount: 'number',
                splinter: 'string',
                splinterIcon: 'string',
                summonerIcon: 'string',
                summonerName: 'string',
                monsters: 'array',
              },
              default: {
                id: '$.id',
                mana: '$.mana',
                monsterCount: '$.monsterCount',
                splinter: '$.splinter',
                splinterIcon: '$.splinterIcon',
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
