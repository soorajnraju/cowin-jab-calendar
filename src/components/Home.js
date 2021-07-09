import { useState, useEffect } from 'react';
import './Home.css';
import { API_BASE } from '../constants';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import reactDom from 'react-dom';
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import swal from 'sweetalert';
import banner from '../assets/images/vaccine.jpg';

function Home() {
    const localizer = momentLocalizer(moment);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [districtId, setDistrictId] = useState(363); //Pune
    const [jabsEvents, setJabsEvents] = useState([]);
    const [jabsEventsKey, setJabsEventsKey] = useState(0);
    const [ajaxLoading, setAjaxLoading] = useState(false);

    useEffect(() => {
        setAjaxLoading(true);
        fetch(API_BASE + "v2/admin/location/states")
            .then(res => res.json())
            .then(
                (result) => {
                    setStates(result.states);
                    setAjaxLoading(false);
                },
                (error) => {
                }
            )
        getJabsEvents();
    }, [])

    const eventStyleGetter = (event, start, end, isSelected) => {
        var backgroundColor = event.item.color;
        var style = {
            backgroundColor: backgroundColor,
        };
        return {
            style: style
        };
    }

    const getDistricts = (event) => {
        setAjaxLoading(true);
        fetch(API_BASE + "v2/admin/location/districts/" + event.target.value)
            .then(res => res.json())
            .then(
                (result) => {
                    setDistricts(result.districts);
                    setAjaxLoading(false);
                },
                (error) => {
                }
            )
    }

    const setDistrict = (event) => {
        setDistrictId(event.target.value);
    }

    const showEventModal = (event) => {
        console.log(event.item);
        swal("Age Limit: "+event.item.min_age_limit+
        "+"+"\n"+"Vaccine:"+event.item.vaccine+"\n"+
        "Address:"+"\n"+event.item.address+"\n"+"Pin: "+event.item.pincode+"\n"+
        "Fees: "+event.item.fee+" Rs"+"\n"+"Available Capacity Dose1: "+event.item.available_capacity_dose1
        +"\n"+"Available Capacity Dose2: "+event.item.available_capacity_dose2);
    }

    const getJabsEvents = () => {
        const today = new Date();

        let dates = [today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear()];
        for (let i = 1; i < 8; i++) {
            let tempDate = new Date(new Date().setDate(new Date().getDate() + i))
            dates.push(tempDate.getDate() + "-" + (tempDate.getMonth() + 1) + "-" + tempDate.getFullYear());
        }

        let sessionsTemp = [];
        setJabsEvents([]);
        setAjaxLoading(true);
        dates.forEach(async (date) => {
            await fetch(API_BASE + "v2/appointment/sessions/public/findByDistrict?district_id=" + districtId + "&date=" + date)
                .then(res => res.json())
                .then(
                    (result) => {
                        if (result.sessions !== undefined) {
                            result.sessions.map((item, index) => {
                                let temp = [];
                                temp['title'] = item.name + "-" + item.min_age_limit + "+(" + item.vaccine + ")"+"-"+item.pincode;
                                temp['allDay'] = true;
                                let tempDate = item.date.split('-');
                                temp['start'] = new Date(tempDate[2], tempDate[1] - 1, tempDate[0]);
                                temp['end'] = new Date(tempDate[2], tempDate[1] - 1, tempDate[0]);

                                if(item.available_capacity_dose1==0){
                                    item.color='red'
                                }else{
                                    if(item.available_capacity_dose1<10){
                                        item.color='yellow';
                                    }else{
                                        item.color='green';
                                    }
                                }

                                temp['item'] = item;
                                sessionsTemp.push(temp);
                            })
                        }
                    },
                    (error) => {
                    }
                );
        });
        console.log(sessionsTemp);
        setJabsEvents(sessionsTemp);
        setTimeout(() => {
            setJabsEventsKey(Math.random());
            setAjaxLoading(false);
        }, 1000);
    }

    return (
        <div className="container">
            <div className="banner">
                <img src={banner}></img>
            </div>
            <div className="title">Vaccine Availability Checker</div>
            <div className="form-wrapper">
                <form>
                    <div className="form-elements">
                        <label for="input-state">State: </label>
                        <select id="input-state" name="input_state" onChange={getDistricts} required>
                            <option value="">--Select--</option>
                            {states.map(item => (
                                <option key={item.state_id} value={item.state_id}>
                                    {item.state_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-elements">
                        <label for="input-district">District: </label>
                        <select id="input-district" name="input_district" onChange={setDistrict} required>
                            <option value="">--Select--</option>
                            {districts.map(item => (
                                <option key={item.district_id} value={item.district_id}>
                                    {item.district_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-elements">
                        <button type="button" class="btn btn-go" onClick={getJabsEvents}>Go</button>
                    </div>
                </form>
            </div>
            <div className="calendar">
                <Calendar
                    localizer={localizer}
                    events={jabsEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    key={jabsEventsKey}
                    onSelectEvent={event => showEventModal(event)}
                    eventPropGetter={(eventStyleGetter)}
                />
            </div>
            {ajaxLoading &&
                <Loader
                    className="loader"
                    type="Puff"
                    color="#00BFFF"
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
                />
            }
            <div className="footer">
                <p>
                    This cowin calendar was created using the APIs provided by the https://apisetu.gov.in and its created as a study material of mine.
                    I will not be responsibe for any kind of loss or any difficulties which can be caused by this app.
                </p>
            </div>
        </div>
    )
}

export default Home;