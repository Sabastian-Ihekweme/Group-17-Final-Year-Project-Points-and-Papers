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

function SearchResources () {

    const navigate = useNavigate();
    const { session } = UserAuth();
    const { searchResources, unlockResource, unlockedResources, loading } = UseResource();
    
    // State Management
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

    // Fetch resources on mount
    useEffect(() => {
        const fetchResources = async () => {
            const resources = await searchResources({});
            setAllResources(resources);
            setFilteredResults(resources);
        };

        fetchResources();
    }, []);

    // Apply filters whenever search or filters change
    useEffect(() => {
        applyFiltersAndSearch();
    }, [searchQuery, filters, allResources]);

    // Helper Functions
    function getLevel (courseCode) {
        let resourceLevel = 'unknown';
        const codeNum = parseInt(courseCode.slice(-3));
        
        if (codeNum >= 100 && codeNum < 200) {
            resourceLevel = '100L';
        } else if (codeNum >= 200 && codeNum < 300) {
            resourceLevel = '200L';
        } else if (codeNum >= 300 && codeNum < 400) {
            resourceLevel = '300L';
        } else if (codeNum >= 400 && codeNum < 500) {
            resourceLevel = '400L';
        } else if (codeNum >= 500 && codeNum < 600) {
            resourceLevel = '500L';
        } else if (codeNum >= 600 && codeNum < 700) {
            resourceLevel = '600L';
        } else {
            resourceLevel = 'unknown';
        }

        return resourceLevel;
    }

    function getTitleDescription (type) {
        let titleDescription = 'Resource';
        
        if (type === 'report/essay') {
            titleDescription = 'Report'
        } else if (type === 'midterm exam') {
            titleDescription = 'Midterms';
        } else if (type === 'final exam') {
            titleDescription = 'Finals';
        } else {
            titleDescription = 'Resource';
        }

        return titleDescription;
    }

    function getPoints (type) {
        let points = 3;

        if (type === 'report/essay') {
            points = 15
        } else if (type === 'midterm exam') {
            points = 30;
        } else if (type === 'final exam') {
            points = 50;
        } else {
            points = 3;
        }

        return points;
    }

    // Filter and Search Logic
    const applyFiltersAndSearch = () => {
        const results = allResources.filter(resource => {
            // Search query filter
            const query = searchQuery.toLowerCase();
            const matchesSearch = !query || 
                resource.title.toLowerCase().includes(query) ||
                resource.course_code.toLowerCase().includes(query) ||
                resource.instructor.toLowerCase().includes(query);

            // Year filter
            const matchesYear = !filters.year || resource.year === parseInt(filters.year);

            // Level filter
            const matchesLevel = !filters.level || getLevel(resource.course_code) === filters.level;

            // Instructor filter
            const matchesInstructor = !filters.instructor || 
                resource.instructor.toLowerCase().includes(filters.instructor.toLowerCase());

            // Department filter
            const matchesDepartment = !filters.department || resource.department === filters.department;

            return matchesSearch && matchesYear && matchesLevel && matchesInstructor && matchesDepartment;
        });

        setFilteredResults(results);
    };

    // Handle Filter Changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Search Input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        applyFiltersAndSearch();
    };

    // Handle Resource Click - Show Modal or Redirect
    const handleResourceClick = (resource) => {
        // Check if user owns this resource
        const isOwnResource = resource.user_id === session?.user?.id;
        
        // Skip unlock modal for own resources or already unlocked
        if (isOwnResource || unlockedResources.includes(resource.id)) {
            redirectToDetails(resource);
        } else {
            // Show unlock modal for locked resources
            setSelectedResource(resource);
            setShowModal(true);
        }
    };

    // Handle Unlock Confirmation
    const handleUnlock = async () => {
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

    // Redirect to details page
    const redirectToDetails = (resource) => {
        const redirectPath = resource.file_type === 'pdf' 
            ? `/resource-details-pdf/${resource.id}` 
            : `/resource-details-image/${resource.id}`;
        
        navigate(redirectPath, { state: { resource } });
    };

    // Handle Cancel
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

    return (
        <>
            <Header />

            <div className="resource-search">
                <h1>Resource Search</h1>

                <form onSubmit={handleSubmit}>
                    <div className="search-bar">
                        <img className="search-icon" src={SearchIcon} alt="search" />
                        <input 
                            className="input-search" 
                            placeholder="Search by title, course code, instructor, or keywords..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="filters">
                        <div className="filter">
                            <select 
                                id="year" 
                                name="year"
                                value={filters.year}
                                onChange={handleFilterChange}
                            >
                                <option value="">Select Year</option>
                                <option value="2019">2019</option>
                                <option value="2020">2020</option>
                                <option value="2021">2021</option>
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>

                        <div className="filter">
                            <select 
                                id="level" 
                                name="level"
                                value={filters.level}
                                onChange={handleFilterChange}
                            >
                                <option value="">Select Level</option>
                                <option value="100L">100 Level</option>
                                <option value="200L">200 Level</option>
                                <option value="300L">300 Level</option>
                                <option value="400L">400 Level</option>
                                <option value="500L">500 Level</option>
                                <option value="600L">600 Level</option>
                            </select>
                        </div>

                        <div className="filter">
                            <input 
                                className="filter-instructor" 
                                name="instructor" 
                                placeholder="Instructor/Lecturer"
                                value={filters.instructor}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter">
                            <select 
                                id="department" 
                                name="department"
                                value={filters.department}
                                onChange={handleFilterChange}
                            >
                                <option value="">Select Department</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Cyber Security">Cyber Security</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Information Systems">Information Systems</option>
                                <option value="Software Engineering">Software Engineering</option>
                            </select>
                        </div>

                        <button type="submit" className="filter-button">Search</button>
                    </div>
                </form>

                <h2 className="search-result-count">
                    Search Results ({filteredResults.length} Results Found)
                </h2>

                <div className="search-results">
                    {filteredResults.length > 0 ? (
                        filteredResults.map((result) => (
                            <div 
                                key={result.id}
                                className="result-resource"
                                onClick={() => handleResourceClick(result)}
                            >
                                <p className="result-type">{result.resource_type}</p>

                                <p className="result-title">
                                    {result.course_code} {getTitleDescription(result.resource_type)}
                                </p>
                                
                                <div className="result-note">
                                    <span>{result.title}</span>
                                </div>

                                <div className="result-info">
                                    <div className="department">
                                        <img className="result-info-icon" src={department} alt="department" />
                                        {result.course_code} 
                                    </div>

                                    <div className="level">
                                        <img className="result-info-icon" src={level} alt="level" />
                                        {getLevel(result.course_code)}
                                    </div>

                                    <div className="instructor">
                                        <img className="result-info-icon" src={instructor} alt="instructor" />
                                        {result.instructor} 
                                    </div>

                                    <p className={`locked-status ${(result.user_id === session?.user?.id || unlockedResources.includes(result.id)) ? 'unlocked' : 'locked'}`}>
                                        {result.user_id === session?.user?.id
                                            ? '👤 Your Resource' 
                                            : unlockedResources.includes(result.id) 
                                                ? 'Unlocked ✓' 
                                                : `Locked (${getPoints(result.resource_type)} pts)`
                                        }
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <p>No resources found matching your search criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Unlock Modal */}
            {showModal && selectedResource && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Unlock Resource</h2>
                        <p className="modal-message">
                            Do you want to unlock this resource?
                        </p>
                        
                        <div className="resource-preview">
                            <h3>{selectedResource.title}</h3>
                            <p className="preview-code">{selectedResource.course_code}</p>
                            <p className="preview-instructor">{selectedResource.instructor}</p>
                            <p className="preview-points">
                                Cost: <span className="points-value">{getPoints(selectedResource.resource_type)} points</span>
                            </p>
                        </div>

                        <div className="modal-buttons">
                            <button 
                                className="btn-unlock"
                                onClick={handleUnlock}
                                disabled={isUnlocking}
                            >
                                {isUnlocking ? 'Unlocking...' : 'Unlock'}
                            </button>
                            <button 
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={isUnlocking}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SearchResources;