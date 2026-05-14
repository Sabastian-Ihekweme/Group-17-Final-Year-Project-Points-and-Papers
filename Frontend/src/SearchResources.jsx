import Header from './Header';
import SearchIcon from './assets/icons/search.png'
import department from './assets/icons/globe.png'
import level from './assets/icons/school.png'
import instructor from './assets/icons/person.png'
import './styles/SearchResources.css'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseResource } from './context/ResourceContext';
import { UserAuth } from './context/AuthContext';
import { useOnlineStatus } from './useOnlineStatus';

function SearchResources () {

    const navigate = useNavigate();
    const { session } = UserAuth();
    const { searchResources, unlockResource, unlockedResources, loading } = UseResource();
    const isOnline = useOnlineStatus();
    
    const [allResources, setAllResources] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        year: '',
        level: '',
        instructor: '',
        department: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);

    useEffect(() => {
        if (!isOnline) return;
        const fetchResources = async () => {
            const resources = await searchResources({});
            setAllResources(resources);
            setFilteredResults(resources);
        };
        fetchResources();
    }, [isOnline]);

    useEffect(() => {
        applyFiltersAndSearch();
    }, [searchQuery, filters, allResources]);

    function getLevel (courseCode) {
        let resourceLevel = 'unknown';
        const codeNum = parseInt(courseCode.slice(-3));
        
        if (codeNum >= 100 && codeNum < 200) resourceLevel = '100L';
        else if (codeNum >= 200 && codeNum < 300) resourceLevel = '200L';
        else if (codeNum >= 300 && codeNum < 400) resourceLevel = '300L';
        else if (codeNum >= 400 && codeNum < 500) resourceLevel = '400L';
        else if (codeNum >= 500 && codeNum < 600) resourceLevel = '500L';
        else if (codeNum >= 600 && codeNum < 700) resourceLevel = '600L';
        else resourceLevel = 'unknown';

        return resourceLevel;
    }

    function getTitleDescription (type) {
        if (type === 'report/essay') return 'Report';
        if (type === 'midterm exam') return 'Midterms';
        if (type === 'final exam') return 'Finals';
        return 'Resource';
    }

    function getPoints (type) {
        if (type === 'report/essay') return 15;
        if (type === 'midterm exam') return 30;
        if (type === 'final exam') return 50;
        return 3;
    }

    const applyFiltersAndSearch = () => {
        const results = allResources.filter(resource => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = !query || 
                resource.title.toLowerCase().includes(query) ||
                resource.course_code.toLowerCase().includes(query) ||
                resource.instructor.toLowerCase().includes(query);

            const matchesYear = !filters.year || resource.year === parseInt(filters.year);
            const matchesLevel = !filters.level || getLevel(resource.course_code) === filters.level;
            const matchesInstructor = !filters.instructor || 
                resource.instructor.toLowerCase().includes(filters.instructor.toLowerCase());
            const matchesDepartment = !filters.department || resource.department === filters.department;

            return matchesSearch && matchesYear && matchesLevel && matchesInstructor && matchesDepartment;
        });

        setFilteredResults(results);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isOnline) return;
        applyFiltersAndSearch();
    };

    const handleResourceClick = (resource) => {
        if (!isOnline) {
            alert("No internet connection. Please check your network and try again.");
            return;
        }
        const isOwnResource = resource.user_id === session?.user?.id;
        if (isOwnResource || unlockedResources.includes(resource.id)) {
            redirectToDetails(resource);
        } else {
            setSelectedResource(resource);
            setShowModal(true);
        }
    };

    const handleUnlock = async () => {
        if (!isOnline) {
            alert("No internet connection. Please check your network and try again.");
            return;
        }
        if (selectedResource) {
            setIsUnlocking(true);
            const result = await unlockResource(selectedResource.id, selectedResource.resource_type);
            if (result.success) {
                setShowModal(false);
                redirectToDetails(selectedResource);
            } else {
                alert('Failed to unlock resource: ' + result.error);
            }
            setIsUnlocking(false);
        }
    };

    const redirectToDetails = (resource) => {
        const redirectPath = resource.file_type === 'pdf' 
            ? `/resource-details-pdf/${resource.id}` 
            : `/resource-details-image/${resource.id}`;
        navigate(redirectPath, { state: { resource } });
    };

    const handleCancel = () => {
        setShowModal(false);
        setSelectedResource(null);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="resource-search">
                    <p>Loading resources...</p>
                </div>
            </>
        );
    }

