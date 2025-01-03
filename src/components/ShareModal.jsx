import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FacebookShareButton, LinkedinShareButton, WhatsappShareButton } from 'react-share'
import { FaFacebook, FaWhatsapp, FaLinkedin } from 'react-icons/fa'



const ShareModal = ({ isOpen, onClose, url }) => {

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger asChild>
                <button className="hidden">Share</button>
            </DialogTrigger>
            <DialogContent className='max-w-[300px]'>

                <DialogHeader>
                    <DialogTitle>Share On</DialogTitle>
                </DialogHeader>

                <div className="flex justify-between">

                    <FacebookShareButton url={url} quote={'Check out this post on Snappy!'} hashtag={'#PostShare'}>
                        <FaFacebook className='text-blue-600 text-4xl' />
                    </FacebookShareButton>

                    <WhatsappShareButton url={url} title={'Check out this post on Snappy!'} separator={' '}>
                        <FaWhatsapp className="text-green-600 text-4xl" />
                    </WhatsappShareButton>

                    <LinkedinShareButton url={url} title={'Check out this post on Snappy!'} summary={'This is a great post!'} source={'MyWebsite'}>
                        <FaLinkedin className='text-blue-700 text-4xl' />
                    </LinkedinShareButton>
                </div>

            </DialogContent>
        </Dialog>
    )
}

export default ShareModal
