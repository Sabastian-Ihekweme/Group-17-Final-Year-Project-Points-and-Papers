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


function SearchResources() {


   const navigate = useNavigate();
   const { session } = UserAuth();
   const { searchResources, unlockResource, unlockedResources, loading, unlockPointsMap } = UseResource();
   const isOnline = useOnlineStatus();


   const [allResources, setAllResources] = useState([]);
   const [filteredResults, setFilteredResults] = useState([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [filters, setFilters] = useState({
       year: '', level: '', instructor: '', department: '', resourceType: ''
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


   function getLevel(courseCode) {
       const codeNum = parseInt(courseCode?.slice(-3));
       if (codeNum >= 100 && codeNum < 200) return '100L';
       if (codeNum >= 200 && codeNum < 300) return '200L';
       if (codeNum >= 300 && codeNum < 400) return '300L';
       if (codeNum >= 400 && codeNum < 500) return '400L';
       if (codeNum >= 500 && codeNum < 600) return '500L';
       if (codeNum >= 600 && codeNum < 700) return '600L';
       return 'unknown';
   }


   function getUnlockCost(type) {
       return unlockPointsMap?.[type] ?? 2;
   }


   const applyFiltersAndSearch = () => {
       const results = allResources.filter(resource => {
           const query = searchQuery.toLowerCase();
           const matchesSearch = !query ||
               resource.title?.toLowerCase().includes(query) ||
               resource.course_code?.toLowerCase().includes(query) ||
               resource.instructor?.toLowerCase().includes(query);


           const matchesYear = !filters.year || resource.year === parseInt(filters.year);
           const matchesLevel = !filters.level || getLevel(resource.course_code) === filters.level;
           const matchesInstructor = !filters.instructor ||
               resource.instructor?.toLowerCase().includes(filters.instructor.toLowerCase());
           const matchesDepartment = !filters.department || resource.department === filters.department;
           const matchesType = !filters.resourceType || resource.resource_type === filters.resourceType;


           return matchesSearch && matchesYear && matchesLevel && matchesInstructor && matchesDepartment && matchesType;
       });


       setFilteredResults(results);
   };


   const handleFilterChange = (e) => {
       const { name, value } = e.target;
       setFilters(prev => ({ ...prev, [name]: value }));
   };


   const handleSearchChange = (e) => setSearchQuery(e.target.value);


   const handleSubmit = (e) => {
       e.preventDefault();
       if (!isOnline) return;
       applyFiltersAndSearch();
   };


   const handleResourceClick = (resource) => {
       if (!isOnline) { alert("No internet connection. Please check your network."); return; }
       const isOwnResource = resource.user_id === session?.user?.id;
       if (isOwnResource || unlockedResources.includes(resource.id)) {
           redirectToDetails(resource);
       } else {
           setSelectedResource(resource);
           setShowModal(true);
       }
   };


   const handleUnlock = async () => {
       if (!isOnline) { alert("No internet connection."); return; }
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


   const handleCancel = () => { setShowModal(false); setSelectedResource(null); };


   if (loading) return <><Header /><div className="resource-search"><p>Loading resources...</p></div></>;


   if (!isOnline) return (
       <>
           <Header />
           <div className="resource-search">
               <h1>Resource Search</h1>
               <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ef4444' }}>
                   <p style={{ fontSize: '48px' }}>📡</p>
                   <h2>No Internet Connection</h2>
                   <p>Please check your network and try again.</p>
               </div>
           </div>
       </>
   );


   return (
       <>
           <Header />


           <div className="resource-search">
               <h1>Resource Search</h1>


               <form onSubmit={handleSubmit}>
                   <div className="search-bar">
                       <img className="search-icon" src={SearchIcon} alt="search" />
                       <input className="input-search"
                           placeholder="Search by title, course code, instructor..."
                           value={searchQuery} onChange={handleSearchChange} />
                   </div>


                   <div className="filters">
                       <div className="filter">
                           <select name="year" value={filters.year} onChange={handleFilterChange}>
                               <option value="">Select Year</option>
                               {[2019,2020,2021,2022,2023,2024,2025,2026].map(y => (
                                   <option key={y} value={y}>{y}</option>
                               ))}
                           </select>
                       </div>


                       <div className="filter">
                           <select name="level" value={filters.level} onChange={handleFilterChange}>
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
                           <select name="resourceType" value={filters.resourceType} onChange={handleFilterChange}>
                               <option value="">All Resource Types</option>
                               <option value="final exam">Final Exam</option>
                               <option value="midterm exam">Midterm Exam</option>
                               <option value="report/essay">Report/Essay</option>
                               <option value="assignment">Assignment</option>
                               <option value="lecture note">Lecture Note</option>
                               <option value="other">Other</option>
                           </select>
                       </div>


                       <div className="filter">
                           <input className="filter-instructor" name="instructor"
                               placeholder="Instructor/Lecturer"
                               value={filters.instructor} onChange={handleFilterChange} />
                       </div>


                       <button type="submit" className="filter-button">Search</button>
                   </div>
               </form>


               <h2 className="search-result-count">
                   Search Results ({filteredResults.length} Results Found)
               </h2>


               <div className="search-results">
                   {filteredResults.length > 0 ? (
                       filteredResults.map((result) => {
                           const isOwn = result.user_id === session?.user?.id;
                           const isUnlocked = unlockedResources.includes(result.id);
                           const cost = getUnlockCost(result.resource_type);


                           return (
                               <div key={result.id} className="result-resource"
                                   onClick={() => handleResourceClick(result)}>
                                   <p className="result-type" style={{ textTransform: 'capitalize' }}>
                                       {result.resource_type}
                                   </p>
                                   <p className="result-title">
                                       {result.course_code} — {result.title}
                                   </p>
                                   <div className="result-note">
                                       <span>{result.description || 'No description provided'}</span>
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
                                       <p className={`locked-status ${(isOwn || isUnlocked) ? 'unlocked' : 'locked'}`}>
                                           {isOwn ? 'Your Resource' : isUnlocked ? 'Unlocked' : `Locked (${cost} pts)`}
                                       </p>
                                   </div>
                               </div>
                           );
                       })
                   ) : (
                       <div className="no-results">
                           <p>No resources found matching your search criteria.</p>
                       </div>
                   )}
               </div>
           </div>


           {showModal && selectedResource && (
               <div className="modal-overlay" onClick={handleCancel}>
                   <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                       <h2>Unlock Resource</h2>
                       <p className="modal-message">Do you want to unlock this resource?</p>
                       <div className="resource-preview">
                           <h3>{selectedResource.title}</h3>
                           <p className="preview-code">{selectedResource.course_code}</p>
                           <p className="preview-instructor">{selectedResource.instructor}</p>
                           <p className="preview-points">
                               Cost: <span className="points-value">{getUnlockCost(selectedResource.resource_type)} points</span>
                           </p>
                       </div>
                       <div className="modal-buttons">
                           <button className="btn-unlock" onClick={handleUnlock} disabled={isUnlocking}>
                               {isUnlocking ? 'Unlocking...' : 'Unlock'}
                           </button>
                           <button className="btn-cancel" onClick={handleCancel} disabled={isUnlocking}>Cancel</button>
                       </div>
                   </div>
               </div>
           )}
       </>
   );
}


export default SearchResources;

