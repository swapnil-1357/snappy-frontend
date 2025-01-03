import { Dialog, DialogHeader, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'




const DeletePostModal = ({ isOpen, onClose, onConfirm, title, description }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <VisuallyHidden.Root>
                        <DialogTitle>{title}</DialogTitle>
                    </VisuallyHidden.Root>
                    <DialogTitle className="font-bold">{title}</DialogTitle>
                </DialogHeader>
                <div>{description}</div>
                <DialogFooter>
                    <Button onClick={onClose} variant="default">Cancel</Button>
                    <Button onClick={onConfirm} variant="destructive">Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeletePostModal
