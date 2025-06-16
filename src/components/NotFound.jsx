import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';



const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <img
                src="./page_not_found.svg"
                alt="Not found"
                width={200}
                height={200}
                className="mb-8"
            />
            <div className="text-4xl font-bold mb-4 font-[Inter]">
                Page Not Found 😢
            </div>
            <p className="mb-4">Looks like this page does not exist</p>
            <Link to={'/'}>
                <Button>Back to Home</Button>
            </Link>
        </div>
    );
};

export default NotFound;
