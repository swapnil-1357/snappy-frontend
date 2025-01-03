import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';




const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <img
                src="./access_denied.svg"
                alt="Access Denied"
                width={200}
                height={200}
                className="mb-8"
            />
            <div className="text-4xl font-bold mb-4 font-[Inter]">
                Snapped Out 👀
            </div>
            <p className="mb-4 font-mono">Have no permission to view this page</p>
            <Button className='flex items-center gap-2' onClick={() => navigate('/sign-in')}>
                <p>Sign In</p> 
                <ExternalLink/>
            </Button>
        </div>
    )
}

export default AccessDenied;
