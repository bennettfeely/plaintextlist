fs = require('fs')

readFileTree = require('readfiletree')

titleize = (str) ->
    return str.replace(/_/g, ' ').replace('.csv', '');

countProperties = (obj) ->
    return Object.keys(obj).length;

get = (cb) ->
  readFileTree '_csv/', (err, tree) ->
    if err
      cb(err)
      return

    full_list = {}
    index_list = {}
    popular_list = {}

    for category, comps of tree
      if category isnt '.DS_Store'
        
        full_list[category] = {}

        for filename, comp of comps
          if filename isnt '.DS_Store'

            full_list[category][filename.toLowerCase()] = {}
            index_list[filename.toLowerCase()] = {}

            if typeof comp is 'string'
              content_array = comp.split(/\r\n|\r|\n/)

              source_title = undefined
              source_url = undefined
              updated = undefined

              # Get the source title and source url
              if content_array[0].startsWith("[Source: ")
                source_title = content_array[0].match(/\[([^)]+)\]/)[1].replace("Source: ", "")
                source_url = content_array[0].match(/\((.*)\)/)[1]

                content_array.shift();

              # Get the updated tag
              if content_array[0].startsWith("[Updated: ")
                updated = content_array[0].replace("[Updated: ","").replace("]","")
                content_array.shift();
              
              console.log(filename);
              console.log(source_title);
              if content_array[1].startsWith("[Updated: ")
                updated = content_array[1].replace("[Updated: ","").replace("]","")
                content_array.shift();

              data = {
                category: category,
                category_length: countProperties(full_list[category]),
                content: content_array,
                folder: filename.replace('.csv', '').toLowerCase(),
                length: content_array.length,
                source_title: source_title,
                source_url: source_url,
                title: titleize(filename),
                updated: updated
              }

              full_list[category][filename.toLowerCase()] = data
              index_list[filename.toLowerCase()] = data

              popular_filename_list = [
                "List_of_Countries_and_Territories.csv",
                "List_of_US_States.csv",
                "List_of_Chemical_Elements.csv",
                "List_of_Time_Zones.csv",
                "List_of_Books_of_the_Bible.csv",
                "List_of_US_Presidents.csv"
              ];

              for popular_filename in popular_filename_list
                if filename.includes(popular_filename)
                  popular_list[filename.toLowerCase()] = data;


    cb null, full_list, popular_list, index_list

module.exports = get