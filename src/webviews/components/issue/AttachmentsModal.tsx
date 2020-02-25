import React, { useState } from 'react';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { AttachmentForm } from './AttachmentForm';
import Button, { ButtonGroup } from '@atlaskit/button';
import { FileWithPath } from 'file-selector';
interface AttachmentsModalProps {
    isOpen: boolean;
    onSave(files: FileWithPath[]): void;
    onCancel(): void;
}

const initialState: File[] = [];

export const AttachmentsModal: React.FunctionComponent<AttachmentsModalProps> = ({ isOpen, onSave, onCancel }) => {
    const [files, setFiles] = useState(initialState);

    const doSave = () => {
        onSave(files);
    };

    if (!isOpen) {
        return <React.Fragment />;
    }

    return (
        <ModalTransition>
            <Modal onClose={onCancel} heading="Add Attachment" shouldCloseOnEscapePress={false}>
                <AttachmentForm onFilesChanged={setFiles} />
                <ButtonGroup>
                    <Button className="ac-button" onClick={doSave} isDisabled={files.length < 1}>
                        Save
                    </Button>
                    <Button className="ac-button" onClick={onCancel}>
                        Cancel
                    </Button>
                </ButtonGroup>
            </Modal>
        </ModalTransition>
    );
};
