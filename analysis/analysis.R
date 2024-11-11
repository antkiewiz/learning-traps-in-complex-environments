library(tidyverse)
library(rio)
library(dplyr)
library(ggplot2)
library(tidyr)
library(gridExtra)
library(readr)
library(stringr)


# ---------------------DATA LOADING----------------------
# Get names of .CSVs
file_names <- list.files("./data", full.names = TRUE)
file_names <- subset(file_names, str_detect(file_names, '\\.csv')) 

# Initialize data frame to hold individual subject data
df <- tibble()

# Loop through each file and import
for (i in 1:length(file_names)) {
  
  # Import a single data file to a temporary data frame
  temp_df <- rio::import(file_names[i]) 
  # Check for incomplete data
  if (all(temp_df$trial_index <= 265)) {
    next
  }
  temp_df <- temp_df %>%
    mutate(
      subject = i,
      block = case_when(
        i >= 1 & i <= 16 ~ 1,
        i >= 17 & i <= 32 ~ 2,
        i >= 33 & i <= 48 ~ 3,
        i >= 49 & i <= 64 ~ 4,
        i >= 65 & i <= 80 ~ 5,
        i >= 81 & i <= 96 ~ 6,
        k >= 1 & k <= 32 ~ 7,
        TRUE ~ NA_real_
      ),
      gender = temp_df[4, 16],
      age = temp_df[4, 17],
      quiz = sum(str_count(stimulus, "Oh no!")),
      danger = str_extract(temp_df[grep("\"\"(dangerpercent)", responses), 15], "\\d+"),
      cA = ifelse(str_detect(temp_df[grep("\"\"(dangerpercent)", responses), 15], "antennae"), 1, 0),
      cB = ifelse(str_detect(temp_df[grep("\"\"(dangerpercent)", responses), 15], "body"), 1, 0),
      cL = ifelse(str_detect(temp_df[grep("\"\"(dangerpercent)", responses), 15], "legs"), 1, 0),
      cW = ifelse(str_detect(temp_df[grep("\"\"(dangerpercent)", responses), 15], "wings"), 1, 0),
      pen = ifelse(str_detect(temp_df[grep("\"\"(dangerpercent)", responses), 15], "yes"), 1, 0)
    )
  
  # Add this participant's data to the global dataset
  df <- bind_rows(df, temp_df)
}


# ---------------------INITIAL PRE-PROCESSING----------------------
n <- df %>%
  distinct(subject_id) %>%
  nrow()
n

# View results
if (nrow(duplicate_trials) > 0) {
  print("The following subject IDs have duplicate trial_index values, suggesting multiple experiment runs:")
  print(duplicate_trials$subject_id)
} else {
  print("No subject has duplicate trial_index values.")
}


df <- df %>% 
  # Remove unnecessary columns
  select(-inputprolificID, -view_history, -condition, -feedback) %>% 
  # Fill NA values by copying each value to the cell above
  fill(earnedThis, .direction = "up") %>% 
  fill(earnedCumulative, .direction = "up")

# Filter rows where success is neither TRUE nor empty
result <- df %>%
  filter(success != TRUE)

# Create columns representing presence of binary features
df <- df %>%
  mutate(
    A = as.numeric(gsub(".*A(\\d+).*", "\\1", stimulus)),
    B = as.numeric(gsub(".*B(\\d+).*", "\\1", stimulus)),
    L = as.numeric(gsub(".*L(\\d+).*", "\\1", stimulus)),
    W = as.numeric(gsub(".*W(\\d+).*", "\\1", stimulus))
  )

# Get the number of rows in the data frame
num_rows <- nrow(df)

# Create vectors to store the split letters
letter1_values <- character(num_rows)
letter2_values <- character(num_rows)

# Iterate through every row using a for loop
for (i in 1:num_rows) {
  # Split the two letters in the relevantDim column
  split_letters <- strsplit(as.character(df$relevantDim[i]), "")[[1]]
  
  # Assign the split letters to respective vectors
  letter1_values[i] <- split_letters[1]
  letter2_values[i] <- split_letters[2]
}

# Create new columns Dim1 and Dim2
df$dim1 <- NA
df$dim2 <- NA

# Iterate through every row using a for loop
for (i in 1:num_rows) {
  # Assign values from the corresponding columns based on letter1_values and letter2_values
  df$dim1[i] <- df[[letter1_values[i]]][i]
  df$dim2[i] <- df[[letter2_values[i]]][i]
}

#create new column response where 1=harvest, 0=avoid
df$response <- ifelse(df$button_pressed == 0, 1, 0)

#create columns representing which binary features were explicitly checked as relevant after the experiment
df <- df %>%
  #participant explicitly identified both relevant dimensions
  mutate(checked_both_rel = ifelse(relevantDim == "LB" & cL == 1  & cB == 1 & cA == 0 & cW == 0, 1,
                               ifelse(relevantDim == "LW" & cL == 1  & cW == 1 & cA == 0 & cB == 0, 1,
                                      ifelse(relevantDim == "LA" & cL == 1  & cA == 1 & cB == 0 & cW == 0, 1,
                                             ifelse(relevantDim == "BA" & cB == 1  & cA == 1 & cL == 0 & cW == 0, 1,
                                                    ifelse(relevantDim == "BW" & cB == 1  & cW == 1 & cL == 0 & cA == 0, 1,
                                                           ifelse(relevantDim == "WA" & cW == 1  & cA == 1 & cL == 0 & cB == 0, 1, 0))))))) %>%
  #participant explicitly identified at least one relevant dimension
  mutate(checked_minone_rel = ifelse(relevantDim == "LB" & (cL == 1  | cB == 1) & cA == 0 & cW == 0, 1,
                                 ifelse(relevantDim == "LW" & (cL == 1  | cW == 1) & cA == 0 & cB == 0, 1,
                                        ifelse(relevantDim == "LA" & (cL == 1  | cA == 1) & cB == 0 & cW == 0, 1,
                                               ifelse(relevantDim == "BA" & (cB == 1  | cA == 1) & cL == 0 & cW == 0, 1,
                                                      ifelse(relevantDim == "BW" & (cB == 1  | cW == 1) & cA == 0 & cL == 0, 1,
                                                             ifelse(relevantDim == "WA" & (cW == 1  | cA == 1 )& cB == 0 & cL == 0, 1, 0))))))) %>%
  #participant explicitly identified only one relevant dimension (at least one relevant and no irrelevant)
  mutate(checked_one_rel = ifelse(checked_both_rel == 0 & checked_minone_rel == 1, 1, 0)) %>%
  select(-checked_minone_rel) %>% 
  #participant checked at least one irrelevant dimension
  mutate(checked_any_irr = ifelse(relevantDim == "LB" & (cA == 1  | cW == 1), 1,
                                 ifelse(relevantDim == "LW" & (cA == 1  | cB == 1), 1,
                                        ifelse(relevantDim == "LA" & (cB == 1  | cW == 1), 1,
                                               ifelse(relevantDim == "BA" & (cL == 1  | cW == 1), 1,
                                                      ifelse(relevantDim == "BW" & (cA == 1  | cL == 1), 1,
                                                             ifelse(relevantDim == "WA" & (cB == 1  | cL == 1 ), 1, 0)))))))

#---------------------EXCLUSIONS---------------------

# Find participants who reported using pen and paper aid
count_pen <- df %>%
  group_by(subject_id) %>%
  filter(any(pen == 1)) %>%
  summarise()
print(count_pen)

# Find participants who needed 5 or more tries to pass the comprehension quiz
count_quiz <- df %>%
  group_by(subject_id) %>%
  filter(any(quiz >= 4)) %>%
  summarise()
print(count_quiz)

# Find people who approached on every trial
count_allapproach <- df %>%
  group_by(subject_id) %>%
  drop_na(button_pressed) %>%
  filter(all(button_pressed == 0)) %>%
  summarise()
print(count_allapproach)

# Find people who avoided on every trial
count_allavoid <- df %>%
  group_by(subject_id) %>%
  drop_na(button_pressed) %>%
  filter(all(button_pressed == 1)) %>%
  summarise()
print(count_allavoid)

# Exclude participants from further analyses
 df <- df %>%
   filter(pen != 1) %>%
   filter(quiz < 5) %>%
   anti_join(count_allapproach, by = "subject_id") %>%
   anti_join(count_allavoid, by = "subject_id") 

#--------------------DEMOGRAPHICS--------------------
n <- df %>%
  distinct(subject_id) %>%
  nrow()
n

# gender demographics
demo_gen <- df %>%
  distinct(subject_id, .keep_all = TRUE) %>%
  count(gender, name = "count")
demo_gen


# age demographics
demo_age <- df %>% 
  distinct(subject_id, .keep_all = TRUE) %>%
  drop_na(age) %>% 
  summarize(mean = mean(age),
            mean_sd = sd(age),
            mean_range = paste(min(age), "-", max(age)),
            median = median(age))
demo_age


#--------------------LEARNING TRAP ANALYSIS----------------------

#select only rows for analysis
lt_df <- df %>%
  filter(task == "original" | task == "modifiedA" | task == "modifiedB" | task == "modifiedL" | task == "modifiedW") %>% 
  mutate(condition = ifelse(task == "original", "Complex", "Simple"))


#check distribution of participants across experimental conditions
equal_check <- lt_df %>%
  select(subject_id, condition) %>%
  distinct() %>% 
  count(condition, name = "count")
equal_check

lt_df$condition = as.factor(lt_df$condition)

# Get the rule proportions table
datarule <- lt_df %>% 
  group_by(subject_id, condition, block) %>%                                    
  mutate(
    # classify the pattern of responses as twodim rule depending on..
    twodimrule = (dim1 & dim2 & !response) | (dim1 & !dim2 & response) | (!dim1 & dim2 & response) | (!dim1 & !dim2 & response), 
    onedimrule1 = (dim1 & !response) | (!dim1 & response),
    onedimrule2 = (dim2 & !response) | (!dim2 & response)) %>% 
  # calculate the mean scores for rules within each block
  summarize(twodimscore = mean(twodimrule),
            onedimscore1 = mean(onedimrule1),
            onedimscore2 = mean(onedimrule2)) %>%
  # take the higher of two means as the onedimscore
  mutate(onedimscore = pmax(onedimscore1, onedimscore2)) %>%
  # arbitrary cutoff for classifying a block as following either two/one/other rule 
  mutate(twodim = as.numeric(twodimscore >= 15/16), 
         onedim = as.numeric(onedimscore >= 15/16),
         other = ifelse(!twodim & !onedim, 1, 0)) %>%
  # reshapes data so that the strategy columns (twodimprop, onedimprop, otherprop) are gathered into two columns: strategy and proportion
  pivot_longer(cols = c(twodim, onedim, other), names_to = "strategy", values_to = "proportion") %>% 
  group_by(block, condition, strategy) %>%
  summarize(proportion = mean(proportion), .groups = 'drop')

#---------GRAPH PROPORTIONS------------
maxblock <- max(datarule$block)

p <- datarule %>%
  mutate(strategy = case_match(strategy,
                               'onedim' ~ 'One Dim',
                               'twodim' ~ 'Two Dim',
                               'other' ~ 'other')) %>%
  ggplot(aes(x=block, y=proportion, group=strategy)) +             
  geom_area(aes(fill=strategy)) +
  facet_grid(.~condition) + #split by task
  theme(
    plot.background = element_rect(fill = "transparent",colour = NA),
    legend.background = element_rect(fill = "transparent",colour = NA)
  ) +
  scale_x_continuous(breaks=seq(1,maxblock,by=1),
                     labels = c(seq(1,maxblock-1,by=1), "test"),
                     limits = c(1, maxblock)) +
  # excludes other from the legend 
  scale_fill_manual(breaks=c('One Dim', 'Two Dim'),    
                    values=list(`Two Dim` = "darkgreen",            
                                `other`= alpha("#FFFFFF", 0),   
                                `One Dim` = "#AA0000")) +         
  theme(panel.grid.major = element_line(colour = "#AAAAAA")) +
  theme_bw() +
  theme(legend.position="bottom") +
  labs(fill = 'Strategy')
p

ggsave(filename = "rule_plot.png", plot = p,
       height = 3.5, width = 4)    


# #----------------TESTS ON BEHAVIOURAL MEASURES--------------
dim_df <- lt_df %>% 
   group_by(subject_id, condition, block) %>%
   mutate(
     twodimrule = (dim1 & dim2 & !response) | (dim1 & !dim2 & response) | (!dim1 & dim2 & response) | (!dim1 & !dim2 & response),
     onedimrule1 = (dim1 & !response) | (!dim1 & response),
     onedimrule2 = (dim2 & !response) | (!dim2 & response)) %>% 
  summarize(twodimscore = mean(twodimrule),
            onedimscore1 = mean(onedimrule1),
            onedimscore2 = mean(onedimrule2)) %>%
  mutate(onedimscore = pmax(onedimscore1, onedimscore2)) %>%
  select(-onedimscore1, -onedimscore2) %>%
  filter(block == 7)


write_csv(dim_df, paste0("test3.csv")) 


#---------------------------------POST-TEST QUESTIONS-------------------------

#percentage of bees believed to be dangerous between environmental conditions
##count quiz
dangerprc <- lt_df %>%
  group_by(subject_id) %>%
  summarize(danger = first(danger))

#Proportion of participants identifying a single or both relevant dimensions
checked <- lt_df %>%
  group_by(subject_id) %>%
  summarize(checked_one_rel = first(checked_one_rel),
            checked_both_rel = first(checked_both_rel),
            checked_any_irr = first(checked_any_irr))

analysis_df <- dim_df %>% 
  left_join(dangerprc, by = "subject_id") %>%
  left_join(checked, by = "subject_id")

write_csv(analysis_df, paste0("analysis_df.csv"))
