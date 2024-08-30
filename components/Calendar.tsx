"use client"; // This directive is used in Next.js for client-side rendering.

import React, { useState, useEffect } from "react";
import { formatDate, DateSelectArg, EventClickArg, EventApi } from "@fullcalendar/core"; // Import FullCalendar core functions and types.
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar React component.
import dayGridPlugin from "@fullcalendar/daygrid"; // Import FullCalendar day grid plugin.
import timeGridPlugin from "@fullcalendar/timegrid"; // Import FullCalendar time grid plugin.
import interactionPlugin from "@fullcalendar/interaction"; // Import FullCalendar interaction plugin.
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import custom Dialog components from the local directory.

// Define the Calendar component
const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]); // State to keep track of current events in the calendar.
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false); // State to control whether the add event dialog is open.
  const [newEventTitle, setNewEventTitle] = useState<string>(""); // State to store the title of the new event.
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null); // State to store the selected date when creating a new event.

  useEffect(() => {
    // Load events from local storage when the component mounts
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("events"); // Get saved events from local storage.
      if (savedEvents) {
        setCurrentEvents(JSON.parse(savedEvents)); // Parse and set events from local storage.
      }
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever they change
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(currentEvents)); // Convert current events to JSON and save them in local storage.
    }
  }, [currentEvents]); // Dependency array to trigger this effect whenever currentEvents changes.

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected); // Set the selected date to state.
    setIsDialogOpen(true); // Open the add event dialog.
  };

  const handleEventClick = (selected: EventClickArg) => {
    // Prompt user for confirmation before deleting an event
    if (window.confirm(`Are you sure you want to delete the event "${selected.event.title}"?`)) {
      selected.event.remove(); // Remove the event from the calendar.
    }
  };

  const handleCloseDialog = () => {
    // Close the add event dialog and reset the input field
    setIsDialogOpen(false);
    setNewEventTitle("");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission reload.
    if (newEventTitle && selectedDate) {
      const calendarApi = selectedDate.view.calendar; // Get the calendar API instance.
      calendarApi.unselect(); // Unselect the date range.

      const newEvent = {
        id: `${selectedDate.start.toISOString()}-${newEventTitle}`, // Unique ID for the new event.
        title: newEventTitle,
        start: selectedDate.start, // Start date of the event.
        end: selectedDate.end, // End date of the event.
        allDay: selectedDate.allDay, // Whether the event is all-day.
      };

      calendarApi.addEvent(newEvent); // Add the new event to the calendar.
      handleCloseDialog(); // Close the dialog after adding the event.
    }
  };

  return (
    <div>
      {/* Main container */}
      <div className="flex w-full px-10 justify-start items-start gap-8">
        {/* Sidebar showing list of events */}
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7">Calendar Events</div>
          <ul className="space-y-4">
            {currentEvents.length <= 0 && <div className="italic text-center text-gray-400">No Events Present</div>}
            {/* Display list of current events */}
            {currentEvents.length > 0 &&
              currentEvents.map((event: EventApi) => (
                <li className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800" key={event.id}>
                  {event.title}<br/>
                  <label className="text-slate-950">
                    {formatDate(event.start!, { year: "numeric", month: "short", day: "numeric" })} {/* Format event start date */}
                  </label>
                </li>
              ))}
          </ul>
        </div>
        
        {/* Main calendar view */}
        <div className="w-9/12 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Initialize calendar with required plugins.
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" }} // Set header toolbar options.
            initialView="dayGridMonth" // Initial view mode of the calendar.
            editable={true} // Allow events to be edited.
            selectable={true} // Allow dates to be selectable.
            selectMirror={true} // Mirror selections visually.
            dayMaxEvents={true} // Limit the number of events displayed per day.
            select={handleDateClick} // Handle date selection to create new events.
            eventClick={handleEventClick} // Handle clicking on events (e.g., to delete them).
            eventsSet={(events) => setCurrentEvents(events)} // Update state with current events whenever they change.
            initialEvents={typeof window !== "undefined" ? JSON.parse(localStorage.getItem("events") || "[]") : []} // Initial events loaded from local storage.
          />
        </div>
      </div>

      {/* Dialog for adding new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event Details</DialogTitle>
          </DialogHeader>
          <form className="space-x-5 mb-4" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)} // Update new event title as the user types.
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <button className="bg-green-500 text-white p-3 mt-5 rounded-md" type="submit">Add</button> {/* Button to submit new event */}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar; // Export the Calendar component for use in other parts of the application.