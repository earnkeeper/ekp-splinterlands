import {
  Button,
  Form,
  formValue,
  hideModal,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  runAll,
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
        children: [Span({ content: 'Add Fantasy Deck' })],
      }),
      ModalBody({
        children: [
          Form({
            name: 'deck-name',
            onSubmit: runAll(
              {
                method: 'addFantasy',
                target: process.env.EKP_PLUGIN_ID,
                params: [formValue('deck-name', 'name'), '$'],
              },
              hideModal(PROMPT_DECK_NAME_MODAL_ID),
            ),
            schema: {
              type: 'object',
              properties: {
                name: 'string',
              },
              default: {
                manaCap: '',
              },
              required: ['name'],
            },
            children: [
              Input({
                label: 'Choose a name for your fantasy deck',
                name: 'name',
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
