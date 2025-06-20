import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/context/UserContext';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useAuth } from '@/context/AuthContext';




const EditProfileModal = ({ isOpen, onClose }) => {
    const { editUser, userProfile, userAvatar } = useUser();
    const { user } = useAuth()

    const [name, setName] = useState(user.name);
    const [about, setAbout] = useState(user.about);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(userAvatar);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
    };

    const handleSave = async () => {
        try {
            await editUser({ username: user.username, name, about }, file);
            onClose();
        } catch (error) {
            // console.log('handle save failed due to error: ', error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-[400px] py-10'>
                <DialogHeader>
                    <VisuallyHidden.Root>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </VisuallyHidden.Root>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col gap-4'>
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />

                    <Label>About</Label>
                    <Input value={about} onChange={(e) => setAbout(e.target.value)} />

                    <Label>Profile Picture</Label>
                    <div className='flex items-center gap-4'>
                        <Avatar className='h-20 w-20'>
                            <AvatarImage src={previewUrl} alt='Profile Picture Preview' />
                            <AvatarFallback>{user.username ? user.username[0] : 'U'}</AvatarFallback>
                        </Avatar>
                        <Input type='file' onChange={handleFileChange} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onClose} variant="ghost">Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;