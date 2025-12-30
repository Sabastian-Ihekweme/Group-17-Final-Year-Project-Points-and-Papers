import Header from './Header';
import SearchIcon from './assets/icons/search.png'
import department from './assets/icons/globe.png'
import level from './assets/icons/school.png'
import instructor from './assets/icons/person.png'
import './styles/SearchResources.css'

function SearchResources () {

    const results = [
        {
            type: 'report/essay',
            title: 'SIWES Report',
            courseCode: 'ITP399',
            instructor: 'Dr Serdar Surgun',
            year: '2025'
        },

        {
            type: 'final exam',
            title: 'Data Structures Final Exam',
            courseCode: 'SEN204',
            instructor: 'Dr Temitope Atoyebi',
            year: '2024'
        },

        {
            type: 'midterm exam',
            title: 'DBMS midterms',
            courseCode: 'SEN304',
            instructor: 'Dr Bilkisu Muhammad-Bello',
            year: '2022'
        },

        {
            type: 'midterm exam',
            title: 'Financial Accounting midterm exam',
            courseCode: 'ACC201',
            instructor: 'Mr Usman',
            year: '2025'
        },

        {
            type: 'final exam',
            title: 'Operating Systems final exam',
            courseCode: 'CSC205',
            instructor: 'Mr Salisu Abubakar',
            year: '2025'
        },

        {
            type: 'final exam',
            title: 'Mathematics exam',
            courseCode: 'MAT101',
            instructor: 'Mr Peter Koloeso',
            year: '2022'
        },

        {
            type: 'report/essay',
            title: 'Design & Implementation of an Academic Resource Exchange Platform',
            courseCode: 'SEN499',
            instructor: 'Dr Anka Ibrahim',
            year: '2026'
        },

        {
            type: 'midterm exam',
            title: 'Software Architecture & Design Midterms',
            courseCode: 'SEN410',
            instructor: 'Mr Abdulsalam Nur',
            year: '2025'
        },

               {
            type: 'report/essay',
            title: 'SIWES Report',
            courseCode: 'ITP399',
            instructor: 'Dr Serdar Surgun',
            year: '2025'
        },

        {
            type: 'final exam',
            title: 'Data Structures Final Exam',
            courseCode: 'SEN204',
            instructor: 'Dr Temitope Atoyebi',
            year: '2024'
        },

        {
            type: 'midterm exam',
            title: 'DBMS midterms',
            courseCode: 'SEN304',
            instructor: 'Dr Bilkisu Muhammad-Bello',
            year: '2022'
        },

        {
            type: 'midterm exam',
            title: 'Financial Accounting midterm exam',
            courseCode: 'ACC201',
            instructor: 'Mr Usman',
            year: '2025'
        },

        {
            type: 'final exam',
            title: 'Operating Systems final exam',
            courseCode: 'CSC205',
            instructor: 'Mr Salisu Abubakar',
            year: '2025'
        },

        {
            type: 'final exam',
            title: 'Mathematics exam',
            courseCode: 'MAT101',
            instructor: 'Mr Peter Koloeso',
            year: '2022'
        },

        {
            type: 'report/essay',
            title: 'Design & Implementation of an Academic Resource Exchange Platform',
            courseCode: 'SEN499',
            instructor: 'Dr Anka Ibrahim',
            year: '2026'
        },

        {
            type: 'midterm exam',
            title: 'Software Architecture & Design Midterms',
            courseCode: 'SEN410',
            instructor: 'Mr Abdulsalam Nur',
            year: '2025'
        },
    ]


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
       };

       return resourceLevel;
    };

    function getTitleDescription (type) {
        let titleDescription = 'Resource';
        
        if (type == 'report/essay') {
            titleDescription = 'Report'
        } else if (type == 'midterm exam') {
            titleDescription = 'Midterms';
        } else if (type == 'final exam') {
            titleDescription = 'Finals';
        } else {
            titleDescription = 'Resource';
        }

        return titleDescription;
    };

    function getPoints (type) {
        let points = 3;

        if (type == 'report/essay') {
            points = 5
        } else if (type == 'midterm exam') {
            points = 20;
        } else if (type == 'final exam') {
            points = 30;
        } else {
            points = 3;
        }

        return points
    }

    return (
        <>
            <Header />

            <div className="resource-search">

            <h1>Resource Search</h1>

            <form>

            <div className="search-bar">
                <img className="search-icon" src={SearchIcon} />
                <input className="input-search" placeholder="Search by title, course code, instructor, or keywords..."/>
            </div>

            <div className="filters">

            <div className="filter">
                <select id="year" name="year">
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
                <select id="level" name="level">
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
                <input className="filter-instructor" name="filter-instructor" 
                placeholder="Instructor/Lecturer"/>
            </div>

            <div className="filter">
                <select id="department" name="department">
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Software Engineering">Software Engineering</option>
                </select>
                </div>

                <button type="submit" className="filter-button">Apply Filters</button>

            </div>
            </form>

            
            <h2 className="search-result-count">Search Results ({results.length} Results Found)</h2>

            <div className="search-results">



           {
                results.map((result) => (
                    <div className="result-resource">
                        <p className="result-type">{result.type}</p>

                        <p className="result-title">{result.courseCode} {getTitleDescription(result.type)}</p>
                        
                        <div className="result-note">
                        <span>{result.title}</span>
                        </div>

                        <div className="result-info">
                            <div className="department">
                                <img className="result-info-icon" src={department} />
                                {result.courseCode} 
                            </div>

                            <div className="level">
                                <img className="result-info-icon" src={level} />
                                {getLevel(result.courseCode)}
                            </div>

                            <div className="instructor">
                                <img className="result-info-icon" src={instructor} />
                                {result.instructor} 
                            </div>


                            <p className="locked-status locked">Locked ({getPoints(result.type)} pts)</p>

                    </div>

                    </div>
                ))
           }
           

            </div>

            </div>
        </>
    )

}

export default SearchResources;